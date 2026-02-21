"""
Ejari-Style Tenancy Contract PDF Generator
Generates Dubai RERA-compliant tenancy contract documents.
"""
import io
import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas


# Dubai Green & Gold theme
EJARI_GREEN = HexColor('#006C35')
EJARI_GOLD = HexColor('#C4A84F')
DARK_TEXT = HexColor('#1a1a1a')
GRAY_TEXT = HexColor('#666666')
LIGHT_BG = HexColor('#F5F5F0')
BORDER_COLOR = HexColor('#CCCCCC')


def get_ejari_styles():
    """Custom styles for Ejari contract."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'EjariTitle',
        parent=styles['Title'],
        fontSize=22,
        textColor=EJARI_GREEN,
        spaceAfter=4,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    ))

    styles.add(ParagraphStyle(
        'EjariArabic',
        parent=styles['Normal'],
        fontSize=16,
        textColor=EJARI_GOLD,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=12,
    ))

    styles.add(ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=EJARI_GREEN,
        spaceBefore=16,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        borderPadding=(0, 0, 4, 0),
    ))

    styles.add(ParagraphStyle(
        'ContractBody',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        'ContractBold',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        fontName='Helvetica-Bold',
    ))

    styles.add(ParagraphStyle(
        'SmallGray',
        parent=styles['Normal'],
        fontSize=7.5,
        textColor=GRAY_TEXT,
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontSize=8,
        textColor=GRAY_TEXT,
        fontName='Helvetica',
    ))

    styles.add(ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontSize=10,
        textColor=DARK_TEXT,
        fontName='Helvetica-Bold',
    ))

    return styles


def generate_ejari_pdf(lease):
    """
    Generate a professional Ejari-style tenancy contract PDF.
    Returns a BytesIO buffer containing the PDF.
    """
    buffer = io.BytesIO()

    tenant = lease.tenant
    unit = lease.unit
    prop = unit.property
    org = prop.organization

    # Generate Ejari number if not set
    ejari_number = tenant.ejari_number or f"EJ-{datetime.now().strftime('%Y')}-{lease.id:05d}"

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = get_ejari_styles()
    story = []

    # ============================================================
    # HEADER SECTION
    # ============================================================
    # Top border line
    story.append(HRFlowable(width="100%", thickness=3, color=EJARI_GREEN, spaceAfter=10))

    # Arabic Title
    story.append(Paragraph("عقد إيجار موحد", styles['EjariArabic']))

    # English Title
    story.append(Paragraph("UNIFIED TENANCY CONTRACT", styles['EjariTitle']))

    # Subtitle
    story.append(Paragraph(
        "Emirate of Dubai — Real Estate Regulatory Agency (RERA)",
        styles['SmallGray']
    ))

    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=EJARI_GOLD, spaceAfter=12))

    # Contract reference box
    ref_data = [
        [
            Paragraph("Ejari Registration No.", styles['FieldLabel']),
            Paragraph("Contract Date", styles['FieldLabel']),
            Paragraph("Contract Type", styles['FieldLabel']),
        ],
        [
            Paragraph(ejari_number, styles['FieldValue']),
            Paragraph(datetime.now().strftime("%d %B %Y"), styles['FieldValue']),
            Paragraph("RESIDENTIAL LEASE", styles['FieldValue']),
        ],
    ]

    ref_table = Table(ref_data, colWidths=[6 * cm, 5 * cm, 5.5 * cm])
    ref_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
        ('BACKGROUND', (0, 1), (-1, 1), white),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(ref_table)
    story.append(Spacer(1, 16))

    # ============================================================
    # SECTION 1: PARTIES
    # ============================================================
    story.append(Paragraph("SECTION 1: PARTIES TO THE CONTRACT", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=8))

    # Landlord Info
    story.append(Paragraph("<b>LANDLORD (Party of the First Part)</b>", styles['ContractBody']))

    landlord_data = [
        [Paragraph("Company Name", styles['FieldLabel']), Paragraph(org.name, styles['FieldValue'])],
        [Paragraph("License No.", styles['FieldLabel']), Paragraph(f"DED-{org.id:06d}", styles['FieldValue'])],
        [Paragraph("Representative", styles['FieldLabel']), Paragraph(org.owner.get_full_name() or org.owner.username, styles['FieldValue'])],
        [Paragraph("Contact", styles['FieldLabel']), Paragraph(org.owner.phone or "N/A", styles['FieldValue'])],
    ]

    l_table = Table(landlord_data, colWidths=[4 * cm, 12.5 * cm])
    l_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(l_table)
    story.append(Spacer(1, 10))

    # Tenant Info
    story.append(Paragraph("<b>TENANT (Party of the Second Part)</b>", styles['ContractBody']))

    tenant_data = [
        [Paragraph("Full Name", styles['FieldLabel']), Paragraph(tenant.name, styles['FieldValue'])],
        [Paragraph("Emirates ID", styles['FieldLabel']), Paragraph(tenant.emirates_id or "N/A", styles['FieldValue'])],
        [Paragraph("Passport No.", styles['FieldLabel']), Paragraph(tenant.passport_number or "N/A", styles['FieldValue'])],
        [Paragraph("Nationality", styles['FieldLabel']), Paragraph(tenant.nationality or "N/A", styles['FieldValue'])],
        [Paragraph("Email", styles['FieldLabel']), Paragraph(tenant.email, styles['FieldValue'])],
        [Paragraph("Phone", styles['FieldLabel']), Paragraph(tenant.phone or "N/A", styles['FieldValue'])],
    ]

    t_table = Table(tenant_data, colWidths=[4 * cm, 12.5 * cm])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_table)

    # ============================================================
    # SECTION 2: PROPERTY DETAILS
    # ============================================================
    story.append(Paragraph("SECTION 2: PROPERTY DETAILS", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=8))

    prop_data = [
        [Paragraph("Property Name", styles['FieldLabel']), Paragraph(prop.name, styles['FieldValue'])],
        [Paragraph("Address", styles['FieldLabel']), Paragraph(prop.address, styles['FieldValue'])],
        [Paragraph("City", styles['FieldLabel']), Paragraph(prop.city, styles['FieldValue'])],
        [Paragraph("Unit Number", styles['FieldLabel']), Paragraph(unit.unit_number, styles['FieldValue'])],
        [Paragraph("Unit Type", styles['FieldLabel']), Paragraph(unit.get_unit_type_display(), styles['FieldValue'])],
        [Paragraph("Bedrooms", styles['FieldLabel']), Paragraph(str(unit.bedrooms), styles['FieldValue'])],
        [Paragraph("Bathrooms", styles['FieldLabel']), Paragraph(str(unit.bathrooms), styles['FieldValue'])],
        [Paragraph("Area (sq ft)", styles['FieldLabel']), Paragraph(str(unit.square_feet or "N/A"), styles['FieldValue'])],
        [Paragraph("Usage", styles['FieldLabel']), Paragraph(prop.get_property_type_display(), styles['FieldValue'])],
    ]

    p_table = Table(prop_data, colWidths=[4 * cm, 12.5 * cm])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(p_table)

    # ============================================================
    # SECTION 3: LEASE TERMS
    # ============================================================
    story.append(Paragraph("SECTION 3: LEASE TERMS AND RENT", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=8))

    duration_months = (lease.end_date.year - lease.start_date.year) * 12 + (lease.end_date.month - lease.start_date.month)

    lease_data = [
        [Paragraph("Contract Start", styles['FieldLabel']), Paragraph(lease.start_date.strftime("%d %B %Y"), styles['FieldValue'])],
        [Paragraph("Contract End", styles['FieldLabel']), Paragraph(lease.end_date.strftime("%d %B %Y"), styles['FieldValue'])],
        [Paragraph("Duration", styles['FieldLabel']), Paragraph(f"{duration_months} Months", styles['FieldValue'])],
        [Paragraph("Annual Rent", styles['FieldLabel']), Paragraph(f"AED {lease.rent_amount:,.2f}", styles['FieldValue'])],
        [Paragraph("Payment Plan", styles['FieldLabel']), Paragraph(lease.get_payment_frequency_display(), styles['FieldValue'])],
        [Paragraph("Security Deposit", styles['FieldLabel']), Paragraph(f"AED {float(lease.rent_amount) * 0.05:,.2f} (5%)", styles['FieldValue'])],
    ]

    le_table = Table(lease_data, colWidths=[4 * cm, 12.5 * cm])
    le_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(le_table)

    # ============================================================
    # SECTION 4: PAYMENT SCHEDULE
    # ============================================================
    story.append(Paragraph("SECTION 4: PAYMENT SCHEDULE (Post-Dated Cheques)", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=8))

    cheques = lease.cheques.all().order_by('cheque_date')

    if cheques.exists():
        cheque_header = [
            Paragraph("<b>No.</b>", styles['FieldLabel']),
            Paragraph("<b>Cheque Number</b>", styles['FieldLabel']),
            Paragraph("<b>Bank</b>", styles['FieldLabel']),
            Paragraph("<b>Amount (AED)</b>", styles['FieldLabel']),
            Paragraph("<b>Due Date</b>", styles['FieldLabel']),
            Paragraph("<b>Status</b>", styles['FieldLabel']),
        ]
        cheque_rows = [cheque_header]

        for i, c in enumerate(cheques):
            cheque_rows.append([
                Paragraph(str(i + 1), styles['ContractBody']),
                Paragraph(c.cheque_number, styles['ContractBody']),
                Paragraph(c.bank_name or "N/A", styles['ContractBody']),
                Paragraph(f"{c.amount:,.2f}", styles['ContractBody']),
                Paragraph(c.cheque_date.strftime("%d/%m/%Y"), styles['ContractBody']),
                Paragraph(c.get_status_display(), styles['ContractBody']),
            ])

        c_table = Table(cheque_rows, colWidths=[1.2 * cm, 3.5 * cm, 3 * cm, 3 * cm, 2.8 * cm, 3 * cm])
        c_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), EJARI_GREEN),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ]))
        story.append(c_table)
    else:
        story.append(Paragraph("No cheques recorded for this lease.", styles['ContractBody']))

    # ============================================================
    # SECTION 5: TERMS & CONDITIONS
    # ============================================================
    story.append(PageBreak())
    story.append(Paragraph("SECTION 5: TERMS AND CONDITIONS", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=8))

    terms = [
        "The Tenant shall use the premises solely for residential purposes as specified in the contract and shall not change the usage without prior written consent from the Landlord and the relevant authorities.",
        "The Tenant shall pay the agreed rent on time through the post-dated cheques as outlined in Section 4. Any bounced cheque shall incur a penalty of AED 1,000 in addition to bank charges.",
        "The Tenant shall maintain the premises in good condition and shall be responsible for any damage caused by the Tenant or their guests, excluding normal wear and tear.",
        "The Landlord shall be responsible for all major structural repairs and maintenance of the building's common areas, including elevators, parking areas, and swimming pools.",
        "The Tenant shall not make any structural modifications to the premises without prior written consent from the Landlord. Any approved modifications shall become the property of the Landlord upon termination of the lease.",
        "The security deposit shall be refundable upon termination of the lease, subject to deduction for any outstanding amounts, damages, or unpaid utilities.",
        "Either party may terminate this contract by providing 90 days written notice before the expiry date. Early termination by the Tenant shall result in forfeiture of the security deposit.",
        "The Tenant shall comply with all rules and regulations of the building management and the Dubai Municipality, including waste disposal, noise levels, and parking regulations.",
        "This contract is governed by the laws of the Emirate of Dubai, including Law No. 26 of 2007 (as amended) regulating the relationship between landlords and tenants in the Emirate of Dubai.",
        "Any disputes arising from this contract shall first be referred to the Rental Disputes Settlement Centre (RDSC) in Dubai.",
    ]

    for i, term in enumerate(terms):
        story.append(Paragraph(
            f"<b>{i + 1}.</b> {term}",
            styles['ContractBody']
        ))
        story.append(Spacer(1, 4))

    # ============================================================
    # SECTION 6: SIGNATURES
    # ============================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("SECTION 6: SIGNATURES", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=EJARI_GREEN, spaceAfter=16))

    sig_data = [
        [
            Paragraph("<b>LANDLORD</b>", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
            Paragraph("<b>TENANT</b>", styles['ContractBody']),
        ],
        [
            Paragraph(f"Name: {org.owner.get_full_name() or org.owner.username}", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
            Paragraph(f"Name: {tenant.name}", styles['ContractBody']),
        ],
        [
            Paragraph(f"Date: {datetime.now().strftime('%d/%m/%Y')}", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
            Paragraph(f"Date: {datetime.now().strftime('%d/%m/%Y')}", styles['ContractBody']),
        ],
        [
            Paragraph("", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
        ],
        [
            Paragraph("____________________________", styles['ContractBody']),
            Paragraph("", styles['ContractBody']),
            Paragraph("____________________________", styles['ContractBody']),
        ],
        [
            Paragraph("Signature & Stamp", styles['SmallGray']),
            Paragraph("", styles['ContractBody']),
            Paragraph("Signature", styles['SmallGray']),
        ],
    ]

    sig_table = Table(sig_data, colWidths=[7 * cm, 2.5 * cm, 7 * cm])
    sig_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(sig_table)

    # Footer
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=1, color=EJARI_GOLD, spaceAfter=6))
    story.append(Paragraph(
        f"This contract was generated by PropOS AI on {datetime.now().strftime('%d %B %Y at %H:%M')}. "
        f"Ejari Registration: {ejari_number} | Dubai, United Arab Emirates",
        styles['SmallGray']
    ))
    story.append(Paragraph(
        "This document is a simulated Ejari contract for demonstration purposes.",
        styles['SmallGray']
    ))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer, ejari_number