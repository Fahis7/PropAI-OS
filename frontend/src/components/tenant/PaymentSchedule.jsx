import { useTheme } from '../../context/ThemeContext';
import { CheckCircle, Clock, CreditCard } from 'lucide-react';

const PaymentSchedule = ({ cheques }) => {
    const { c } = useTheme();
    const getStyle = (s) => { switch(s) { case 'PAID': return c.greenBg; case 'PENDING': return c.blueBg; case 'BOUNCED': return c.redBg; default: return c.btn2; }};

    return (
        <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border}>
            <div className={'p-5 border-b ' + c.border}>
                <h3 className={'text-lg font-bold ' + c.heading}>Payment Schedule</h3>
                <p className={'text-sm ' + c.textMut}>Post-dated cheques for current lease</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className={c.bg}><tr>
                        {['Cheque #','Due Date','Amount','Status'].map(h => <th key={h} className={'px-6 py-3 text-xs uppercase font-semibold ' + c.textMut}>{h}</th>)}
                    </tr></thead>
                    <tbody className={'divide-y ' + c.border}>
                        {cheques?.length > 0 ? cheques.map((ch, i) => (
                            <tr key={i} className={c.card + ' ' + c.hover + ' transition'}>
                                <td className={'px-6 py-4 text-sm font-medium ' + c.heading}>{ch.cheque_number}</td>
                                <td className={'px-6 py-4 text-sm ' + c.textSec}>{new Date(ch.cheque_date).toLocaleDateString('en-AE',{year:'numeric',month:'short',day:'numeric'})}</td>
                                <td className={'px-6 py-4 text-sm font-bold ' + c.heading}>{'AED ' + parseFloat(ch.amount).toLocaleString()}</td>
                                <td className="px-6 py-4"><span className={'px-3 py-1 rounded-full text-xs font-medium border ' + getStyle(ch.status)}>{ch.status}</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className={'px-6 py-10 text-center italic ' + c.textMut}>No payment records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentSchedule;