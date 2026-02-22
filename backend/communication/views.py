import os
import json
import traceback

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Sum, Count, Q

from groq import Groq

from tenants.models import Tenant, Lease
from properties.models import Property, Unit
from finance.models import Cheque
from maintenance.models import MaintenanceTicket
from .models import ChatLog

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def get_tenant_context(user):
    """Build RAG context for a tenant user."""
    try:
        tenant = Tenant.objects.get(user=user)
    except Tenant.DoesNotExist:
        try:
            tenant = Tenant.objects.get(email=user.email)
        except Tenant.DoesNotExist:
            return "No tenant profile found for this user."

    context = f"TENANT PROFILE:\n"
    context += f"- Name: {tenant.name}\n"
    context += f"- Email: {tenant.email}\n"
    context += f"- Phone: {tenant.phone}\n"
    context += f"- Nationality: {tenant.nationality}\n"

    lease = tenant.leases.filter(is_active=True).first()
    if lease:
        unit = lease.unit
        context += f"\nLEASE & UNIT:\n"
        context += f"- Property: {unit.property.name}\n"
        context += f"- Address: {unit.property.address}\n"
        context += f"- Unit: {unit.unit_number} ({unit.unit_type})\n"
        context += f"- Bedrooms: {unit.bedrooms} | Bathrooms: {unit.bathrooms}\n"
        context += f"- Lease: {lease.start_date} to {lease.end_date}\n"
        context += f"- Yearly Rent: AED {lease.rent_amount:,.0f}\n"
        context += f"- Payment Frequency: {lease.get_payment_frequency_display()}\n"

        cheques = lease.cheques.all().order_by('cheque_date')
        if cheques.exists():
            context += f"\nPAYMENT SCHEDULE:\n"
            for c in cheques:
                context += f"- {c.cheque_number}: AED {c.amount:,.0f} | Due: {c.cheque_date} | Status: {c.status}\n"

        # 🆕 Property rules & regulations for chatbot RAG
        if unit.property.rules_and_regulations:
            context += f"\nBUILDING RULES & REGULATIONS:\n{unit.property.rules_and_regulations}\n"

    tickets = MaintenanceTicket.objects.filter(tenant=tenant).order_by('-created_at')[:10]
    if tickets.exists():
        context += f"\nMAINTENANCE TICKETS:\n"
        for t in tickets:
            context += f"- #{t.id}: {t.title} | Priority: {t.priority} | Status: {t.status} | Date: {t.created_at.strftime('%Y-%m-%d')}\n"

    return context


def get_admin_context(user):
    """Build RAG context for an admin/owner/manager user."""
    org = user.organization if hasattr(user, 'organization') else None
    
    if not org and not user.is_superuser:
        return "No organization found for this user."

    if user.is_superuser:
        properties = Property.objects.all()
        units = Unit.objects.all()
        tenants = Tenant.objects.all()
        cheques = Cheque.objects.all()
        tickets = MaintenanceTicket.objects.all()
    else:
        properties = Property.objects.filter(organization=org)
        units = Unit.objects.filter(property__organization=org)
        tenants = Tenant.objects.filter(leases__unit__property__organization=org).distinct()
        cheques = Cheque.objects.filter(organization=org)
        tickets = MaintenanceTicket.objects.filter(organization=org)

    total_units = units.count()
    occupied = units.filter(status='OCCUPIED').count()
    vacant = units.filter(status='VACANT').count()
    occupancy_rate = round((occupied / total_units * 100), 1) if total_units > 0 else 0

    revenue = cheques.filter(status='CLEARED').aggregate(Sum('amount'))['amount__sum'] or 0
    pending = cheques.filter(status='PENDING').aggregate(Sum('amount'))['amount__sum'] or 0
    bounced_count = cheques.filter(status='BOUNCED').count()

    context = f"ORGANIZATION: {org.name if org else 'All Organizations'}\n"
    context += f"\nPROPERTY PORTFOLIO:\n"
    context += f"- Total Properties: {properties.count()}\n"
    context += f"- Total Units: {total_units} (Occupied: {occupied}, Vacant: {vacant})\n"
    context += f"- Occupancy Rate: {occupancy_rate}%\n"
    context += f"- Active Tenants: {tenants.count()}\n"

    context += f"\nFINANCIAL SUMMARY:\n"
    context += f"- Revenue Collected: AED {revenue:,.0f}\n"
    context += f"- Pending Payments: AED {pending:,.0f}\n"
    context += f"- Bounced Cheques: {bounced_count}\n"

    context += f"\nPROPERTIES:\n"
    for p in properties:
        p_units = p.units.count()
        p_vacant = p.units.filter(status='VACANT').count()
        context += f"- {p.name} ({p.property_type}) — {p.address} | Units: {p_units} (Vacant: {p_vacant})\n"
        if p.rules_and_regulations:
            context += f"  Rules: {p.rules_and_regulations[:200]}...\n"

    context += f"\nALL UNITS:\n"
    for u in units:
        context += f"- {u.property.name} / Unit {u.unit_number} ({u.unit_type}) | Rent: AED {u.yearly_rent:,.0f} | Status: {u.status}\n"

    context += f"\nTENANTS:\n"
    for t in tenants[:20]:
        active_lease = t.leases.filter(is_active=True).first()
        unit_info = f"Unit {active_lease.unit.unit_number}" if active_lease else "No active lease"
        context += f"- {t.name} ({t.email}) | {unit_info}\n"

    context += f"\nRECENT MAINTENANCE TICKETS:\n"
    for t in tickets.order_by('-created_at')[:15]:
        context += f"- #{t.id}: {t.title} | Unit: {t.unit.unit_number if t.unit else 'N/A'} | Priority: {t.priority} | Status: {t.status}\n"

    context += f"\nCHEQUES (Recent):\n"
    for c in cheques.order_by('-cheque_date')[:20]:
        context += f"- {c.cheque_number}: AED {c.amount:,.0f} | Tenant: {c.tenant.name if c.tenant else 'N/A'} | Due: {c.cheque_date} | Status: {c.status}\n"

    return context


def detect_ticket_intent(message):
    """Check if the user wants to create a maintenance ticket."""
    keywords = ['report', 'leak', 'broken', 'fix', 'repair', 'issue', 'problem',
                'not working', 'damage', 'flood', 'fire', 'smoke', 'no water',
                'no electricity', 'ac not', 'create ticket', 'maintenance request',
                'submit request', 'log a complaint']
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in keywords)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """
    Phase 4: RAG Chatbot Concierge (Powered by Groq + Llama 3.3)
    POST /api/chat/
    Body: { "message": "...", "history": [...] }
    """
    user = request.user
    message = request.data.get('message', '').strip()
    history = request.data.get('history', [])

    if not message:
        return Response({"response": "Please type a message."}, status=400)

    # Determine user role
    role = getattr(user, 'role', 'TENANT')
    is_admin = role in ['SUPER_ADMIN', 'OWNER', 'MANAGER'] or user.is_superuser

    # Build RAG context
    if is_admin:
        rag_context = get_admin_context(user)
    else:
        rag_context = get_tenant_context(user)

    # Detect maintenance ticket intent
    wants_ticket = not is_admin and detect_ticket_intent(message)

    # Build system prompt
    system_prompt = f"""You are PropOS AI, an intelligent property management assistant for a Dubai-based SaaS platform.

YOUR CAPABILITIES:
1. Answer questions about the user's property data (leases, payments, maintenance, units)
2. Answer general knowledge questions on any topic
3. Help tenants report maintenance issues
4. Provide property management advice
5. Answer questions about building rules, pet policies, parking, gym hours, visitor policies, etc.
6. Be friendly, professional, and helpful

USER ROLE: {'Admin/Manager' if is_admin else 'Tenant'}
USER NAME: {user.first_name or user.username}

{'IMPORTANT: This user is an admin. They can ask about any property, unit, tenant, or financial data in their organization.' if is_admin else 'IMPORTANT: This user is a tenant. Only share information about THEIR unit, lease, and payments.'}

PROPERTY DATA CONTEXT:
{rag_context}

RULES:
- When answering about property data, use the context above for accurate numbers
- When answering about building rules, refer to the BUILDING RULES & REGULATIONS section above
- For general questions unrelated to properties, answer normally like a helpful AI
- Use AED for currency, format numbers with commas
- Be concise but thorough
- If you don't know something specific, say so honestly
- For maintenance issues from tenants, ask for details and suggest creating a ticket
- Keep responses short and conversational (2-4 sentences for simple questions)
"""

    if wants_ticket:
        system_prompt += """
SPECIAL: The tenant seems to be reporting a maintenance issue. 
Ask for: 1) What is the problem? 2) Which room/area? 3) How urgent is it?
Then confirm you'll help them submit a maintenance request.
"""

    # Check if Groq is available
    if not groq_client:
        return Response({
            "response": "I'm PropOS AI! My AI brain isn't connected yet (missing GROQ_API_KEY). Please set it up to enable full chat.",
            "action": None,
        })

    try:
        # Build messages for Groq
        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in history[-10:]:
            if msg.get('sender') == 'user':
                messages.append({"role": "user", "content": msg['text']})
            elif msg.get('sender') == 'bot':
                messages.append({"role": "assistant", "content": msg['text']})
        
        messages.append({"role": "user", "content": message})

        # Call Groq API
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )

        ai_text = response.choices[0].message.content

        # Log the chat
        try:
            org = user.organization if hasattr(user, 'organization') and user.organization else None
            if org:
                ChatLog.objects.create(
                    organization=org,
                    user_message=message,
                    ai_response=ai_text[:500],
                )
        except Exception:
            pass

        # Detect if we should offer ticket creation
        action = None
        if wants_ticket:
            action = {
                "type": "CREATE_TICKET",
                "label": "Create Maintenance Request",
                "route": "/tenant/maintenance",
            }

        return Response({
            "response": ai_text,
            "action": action,
        })

    except Exception as e:
        print(f"❌ Chat Error: {e}")
        traceback.print_exc()
        
        if "rate_limit" in str(e).lower() or "429" in str(e):
            return Response({
                "response": "I'm getting a lot of questions right now! Please try again in a moment.",
                "action": None,
            })

        return Response({
            "response": "Sorry, I ran into an issue. Please try again.",
            "action": None,
        }, status=500)