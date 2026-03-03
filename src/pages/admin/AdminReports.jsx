import { useState, useEffect, useRef } from 'react';
import { ordersApi } from '../../utils/api';
import { Download, TrendingUp, ShoppingCart, Package, Calendar, BarChart2, ChevronDown } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

// Chegirma foizi: (eski_narx - sotish_narxi) / eski_narx * 100
// Foyda: sotish_narxi - sotib_olish_narxi (cost_price)
const calcProfit = (items) =>
  items.reduce((acc, item) => acc + (item.cost_price ? (item.price - item.cost_price) * item.qty : 0), 0);

const calcDiscount = (items) =>
  items.reduce((acc, item) => {
    const orig = item.original_price || item.old_price;
    if (orig && orig > item.price) return acc + (orig - item.price) * item.qty;
    return acc;
  }, 0);

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff); d.setHours(0, 0, 0, 0);
  return d;
};

const DAYS_UZ = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export default function AdminReports() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('weekly'); // weekly | monthly
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = this week, 1 = last week...
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = this month

  useEffect(() => {
    ordersApi.getAll({ limit: 500, status: 'delivered' })
      .then(r => setAllOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // --- WEEKLY REPORT ---
  const buildWeeklyReport = () => {
    const today = new Date();
    const weekStart = getWeekStart(today);
    weekStart.setDate(weekStart.getDate() - selectedWeek * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekOrders = allOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= weekStart && d <= weekEnd;
    });

    // Har kun uchun
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = weekOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= day && d <= dayEnd;
      });
      const revenue = dayOrders.reduce((a, o) => a + o.total, 0);
      const profit = dayOrders.reduce((a, o) => a + calcProfit(o.items || []), 0);
      const discount = dayOrders.reduce((a, o) => a + calcDiscount(o.items || []), 0);
      days.push({
        label: DAYS_UZ[day.getDay()],
        date: fmtDate(day),
        orders: dayOrders.length,
        revenue,
        profit,
        discount,
        items: dayOrders,
      });
    }

    const totalRevenue = weekOrders.reduce((a, o) => a + o.total, 0);
    const totalProfit = weekOrders.reduce((a, o) => a + calcProfit(o.items || []), 0);
    const totalDiscount = weekOrders.reduce((a, o) => a + calcDiscount(o.items || []), 0);

    return { weekStart, weekEnd, days, orders: weekOrders, totalRevenue, totalProfit, totalDiscount };
  };

  // --- MONTHLY REPORT ---
  const buildMonthlyReport = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() - selectedMonth;
    const actualMonth = ((month % 12) + 12) % 12;
    const actualYear = year + Math.floor(month / 12);

    const monthStart = new Date(actualYear, actualMonth, 1);
    const monthEnd = new Date(actualYear, actualMonth + 1, 0, 23, 59, 59, 999);

    const monthOrders = allOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= monthStart && d <= monthEnd;
    });

    // Haftalar bo'yicha
    const weeksMap = {};
    monthOrders.forEach(o => {
      const ws = getWeekStart(new Date(o.created_at));
      const key = ws.toISOString().slice(0, 10);
      if (!weeksMap[key]) weeksMap[key] = { start: ws, orders: [] };
      weeksMap[key].orders.push(o);
    });

    const weeks = Object.keys(weeksMap).sort().map(key => {
      const { start, orders: wOrders } = weeksMap[key];
      const end = new Date(start); end.setDate(end.getDate() + 6);
      const revenue = wOrders.reduce((a, o) => a + o.total, 0);
      const profit = wOrders.reduce((a, o) => a + calcProfit(o.items || []), 0);
      const discount = wOrders.reduce((a, o) => a + calcDiscount(o.items || []), 0);
      return { label: `${fmtDate(start)} - ${fmtDate(end)}`, orders: wOrders, revenue, profit, discount };
    });

    const totalRevenue = monthOrders.reduce((a, o) => a + o.total, 0);
    const totalProfit = monthOrders.reduce((a, o) => a + calcProfit(o.items || []), 0);
    const totalDiscount = monthOrders.reduce((a, o) => a + calcDiscount(o.items || []), 0);

    // Top mahsulotlar
    const productSales = {};
    monthOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productSales[item.product_id || item.name]) {
          productSales[item.product_id || item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.product_id || item.name].qty += item.qty;
        productSales[item.product_id || item.name].revenue += item.total;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 10);

    // Mijozlar bo'yicha
    const cityStats = {};
    monthOrders.forEach(o => {
      const city = o.customer_city || "Olib ketish";
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    return { monthStart, monthEnd, monthName: MONTHS_UZ[actualMonth], year: actualYear, weeks, orders: monthOrders, totalRevenue, totalProfit, totalDiscount, topProducts, cityStats };
  };

  const weekly = buildWeeklyReport();
  const monthly = buildMonthlyReport();

  // PDF yuklash
  const downloadPDF = async (type) => {
    // Backend PDF API dan yuklab olamiz
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/report?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `robomarket_hisobot_${type}_${new Date().toISOString().slice(0,10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {}
    // Fallback: brauzer print
    const data = type === 'weekly' ? weekly : monthly;
    const title = type === 'weekly'
      ? `Haftalik hisobot: ${fmtDate(data.weekStart)} - ${fmtDate(data.weekEnd)}`
      : `Oylik hisobot: ${data.monthName} ${data.year}`;

    let html = `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 24px; color: #1c1917; font-size: 13px; background: #fff; }
    h1 { font-size: 20px; font-weight: 900; color: #1c1917; margin-bottom: 4px; }
    h2 { font-size: 15px; font-weight: 700; color: #44403c; margin: 20px 0 10px; border-bottom: 2px solid #f5f0e8; padding-bottom: 6px; }
    .meta { color: #78716c; font-size: 12px; margin-bottom: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 10px; padding: 12px; }
    .stat-val { font-size: 18px; font-weight: 900; color: #1c1917; }
    .stat-lbl { font-size: 11px; color: #78716c; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #fafaf9; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 700; color: #78716c; border-bottom: 1px solid #e7e5e4; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #f5f0e8; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .highlight { font-weight: 700; color: #d97706; }
    .profit { font-weight: 700; color: #0d9488; }
    .discount { font-weight: 700; color: #e11d48; }
    .total-row { background: #fef3c7; font-weight: 900; }
    .footer { margin-top: 30px; text-align: center; color: #a8a29e; font-size: 11px; border-top: 1px solid #e7e5e4; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>RoboMarket — ${title}</h1>
  <div class="meta">Hisobot sanasi: ${fmtDate(new Date())} | Faqat yetkazilgan zakazlar hisobga olingan</div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">${data.orders.length}</div>
      <div class="stat-lbl">Jami zakazlar</div>
    </div>
    <div class="stat-card">
      <div class="stat-val highlight">${fmt(data.totalRevenue)} so'm</div>
      <div class="stat-lbl">Jami daromad</div>
    </div>
    <div class="stat-card">
      <div class="stat-val profit">${fmt(data.totalProfit)} so'm</div>
      <div class="stat-lbl">Jami foyda</div>
    </div>
    <div class="stat-card">
      <div class="stat-val discount">-${fmt(data.totalDiscount)} so'm</div>
      <div class="stat-lbl">Jami chegirma</div>
    </div>
  </div>
`;

    if (type === 'weekly') {
      html += `
  <h2>Kunlik ko'rsatkichlar</h2>
  <table>
    <thead><tr>
      <th>Kun</th><th>Sana</th><th>Zakazlar</th>
      <th>Daromad (so'm)</th><th>Foyda (so'm)</th><th>Chegirma (so'm)</th>
    </tr></thead>
    <tbody>
      ${data.days.map(d => `
        <tr>
          <td><b>${d.label}</b></td>
          <td>${d.date}</td>
          <td>${d.orders}</td>
          <td class="highlight">${fmt(d.revenue)}</td>
          <td class="profit">${fmt(d.profit)}</td>
          <td class="discount">-${fmt(d.discount)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="2"><b>JAMI</b></td>
        <td><b>${data.orders.length}</b></td>
        <td><b>${fmt(data.totalRevenue)}</b></td>
        <td><b>${fmt(data.totalProfit)}</b></td>
        <td><b>-${fmt(data.totalDiscount)}</b></td>
      </tr>
    </tbody>
  </table>

  <h2>Zakaz tafsilotlari</h2>
  <table>
    <thead><tr>
      <th>Zakaz #</th><th>Mijoz</th><th>Tel</th><th>Shahar</th>
      <th>Mahsulotlar</th><th>Jami (so'm)</th><th>Foyda (so'm)</th>
    </tr></thead>
    <tbody>
      ${data.orders.map(o => `
        <tr>
          <td class="highlight">${o.order_number}</td>
          <td><b>${o.customer_name}</b></td>
          <td>${o.customer_phone}</td>
          <td>${o.customer_city || 'Olib ketish'}</td>
          <td>${(o.items || []).map(i => `${i.name} x${i.qty}`).join(', ')}</td>
          <td class="highlight">${fmt(o.total)}</td>
          <td class="profit">${fmt(calcProfit(o.items || []))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
    } else {
      html += `
  <h2>Haftalik ko'rsatkichlar</h2>
  <table>
    <thead><tr>
      <th>Hafta</th><th>Zakazlar</th>
      <th>Daromad (so'm)</th><th>Foyda (so'm)</th><th>Chegirma (so'm)</th>
    </tr></thead>
    <tbody>
      ${data.weeks.map(w => `
        <tr>
          <td><b>${w.label}</b></td>
          <td>${w.orders.length}</td>
          <td class="highlight">${fmt(w.revenue)}</td>
          <td class="profit">${fmt(w.profit)}</td>
          <td class="discount">-${fmt(w.discount)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td><b>JAMI</b></td>
        <td><b>${data.orders.length}</b></td>
        <td><b>${fmt(data.totalRevenue)}</b></td>
        <td><b>${fmt(data.totalProfit)}</b></td>
        <td><b>-${fmt(data.totalDiscount)}</b></td>
      </tr>
    </tbody>
  </table>

  <h2>Top 10 mahsulotlar</h2>
  <table>
    <thead><tr><th>Mahsulot</th><th>Sotildi (ta)</th><th>Daromad (so'm)</th></tr></thead>
    <tbody>
      ${data.topProducts.map((p, i) => `
        <tr>
          <td>${i + 1}. <b>${p.name}</b></td>
          <td>${p.qty}</td>
          <td class="highlight">${fmt(p.revenue)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Viloyatlar bo'yicha zakazlar</h2>
  <table>
    <thead><tr><th>Viloyat</th><th>Zakazlar soni</th></tr></thead>
    <tbody>
      ${Object.entries(data.cityStats).sort((a, b) => b[1] - a[1]).map(([city, cnt]) => `
        <tr><td>${city}</td><td><b>${cnt}</b></td></tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Barcha zakaz tafsilotlari</h2>
  <table>
    <thead><tr>
      <th>Zakaz #</th><th>Mijoz</th><th>Tel</th><th>Shahar</th>
      <th>Sana</th><th>Jami (so'm)</th><th>Foyda (so'm)</th>
    </tr></thead>
    <tbody>
      ${data.orders.map(o => `
        <tr>
          <td class="highlight">${o.order_number}</td>
          <td><b>${o.customer_name}</b></td>
          <td>${o.customer_phone}</td>
          <td>${o.customer_city || 'Olib ketish'}</td>
          <td>${fmtDate(o.created_at)}</td>
          <td class="highlight">${fmt(o.total)}</td>
          <td class="profit">${fmt(calcProfit(o.items || []))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
    }

    html += `<div class="footer">RoboMarket — Hisobot ${fmtDate(new Date())} da yaratildi</div></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
    </div>
  );

  const report = reportType === 'weekly' ? weekly : monthly;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Hisobotlar</h1>
          <p className="text-stone-500 text-sm">Faqat yetkazilgan zakazlar</p>
        </div>
        <button onClick={() => downloadPDF(reportType)} className="btn-primary">
          <Download size={15} />PDF yuklab olish
        </button>
      </div>

      {/* Type selector */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          {[['weekly', 'Haftalik'], ['monthly', 'Oylik']].map(([v, l]) => (
            <button key={v} onClick={() => setReportType(v)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${reportType === v ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {l}
            </button>
          ))}
        </div>
        {reportType === 'weekly' ? (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-stone-400" />
            <select className="select text-sm min-w-36" value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))}>
              <option value={0}>Bu hafta</option>
              <option value={1}>O'tgan hafta</option>
              <option value={2}>2 hafta oldin</option>
              <option value={3}>3 hafta oldin</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-stone-400" />
            <select className="select text-sm min-w-36" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              <option value={0}>Bu oy</option>
              <option value={1}>O'tgan oy</option>
              <option value={2}>2 oy oldin</option>
              <option value={3}>3 oy oldin</option>
            </select>
          </div>
        )}
        <span className="text-xs text-stone-500 font-semibold">
          {reportType === 'weekly'
            ? `${fmtDate(weekly.weekStart)} — ${fmtDate(weekly.weekEnd)}`
            : `${monthly.monthName} ${monthly.year}`}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Zakazlar', value: report.orders?.length || 0, color: 'bg-sky-50 text-sky-600', icon: ShoppingCart },
          { label: 'Daromad', value: `${fmt(report.totalRevenue)} so'm`, color: 'bg-amber-50 text-amber-600', icon: TrendingUp },
          { label: 'Foyda', value: `${fmt(report.totalProfit)} so'm`, color: 'bg-teal-50 text-teal-600', icon: BarChart2 },
          { label: 'Chegirma', value: `-${fmt(report.totalDiscount)} so'm`, color: 'bg-rose-50 text-rose-600', icon: Package },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <Icon size={15} />
            </div>
            <div className="font-black text-stone-900 text-base leading-tight">{value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly table */}
      {reportType === 'weekly' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-black text-stone-800">Kunlik ko'rsatkichlar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 text-xs text-stone-500 uppercase border-b border-stone-100">
                <tr>
                  {['Kun', 'Sana', 'Zakazlar', 'Daromad', 'Foyda', 'Chegirma'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {weekly.days.map((d, i) => (
                  <tr key={i} className={d.orders > 0 ? 'bg-amber-50/30' : ''}>
                    <td className="px-4 py-3 font-black text-stone-800 text-sm">{d.label}</td>
                    <td className="px-4 py-3 text-stone-500 text-sm">{d.date}</td>
                    <td className="px-4 py-3 font-bold text-stone-700">{d.orders}</td>
                    <td className="px-4 py-3 font-black text-amber-600 whitespace-nowrap">{fmt(d.revenue)}</td>
                    <td className="px-4 py-3 font-black text-teal-600 whitespace-nowrap">{fmt(d.profit)}</td>
                    <td className="px-4 py-3 font-black text-rose-500 whitespace-nowrap">-{fmt(d.discount)}</td>
                  </tr>
                ))}
                <tr className="bg-amber-50 border-t-2 border-amber-200">
                  <td className="px-4 py-3 font-black text-stone-800" colSpan={2}>JAMI</td>
                  <td className="px-4 py-3 font-black">{weekly.orders.length}</td>
                  <td className="px-4 py-3 font-black text-amber-700">{fmt(weekly.totalRevenue)}</td>
                  <td className="px-4 py-3 font-black text-teal-700">{fmt(weekly.totalProfit)}</td>
                  <td className="px-4 py-3 font-black text-rose-600">-{fmt(weekly.totalDiscount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly: weeks + top products */}
      {reportType === 'monthly' && (
        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-black text-stone-800">Haftalik ko'rsatkichlar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 text-xs text-stone-500 uppercase border-b border-stone-100">
                  <tr>
                    {['Hafta', 'Zakazlar', 'Daromad', 'Foyda', 'Chegirma'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {monthly.weeks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-stone-400 text-sm">Bu oyda zakaz yo'q</td></tr>
                  ) : monthly.weeks.map((w, i) => (
                    <tr key={i} className="hover:bg-amber-50/20">
                      <td className="px-4 py-3 text-sm font-semibold text-stone-700">{w.label}</td>
                      <td className="px-4 py-3 font-bold">{w.orders.length}</td>
                      <td className="px-4 py-3 font-black text-amber-600 whitespace-nowrap">{fmt(w.revenue)}</td>
                      <td className="px-4 py-3 font-black text-teal-600 whitespace-nowrap">{fmt(w.profit)}</td>
                      <td className="px-4 py-3 font-black text-rose-500 whitespace-nowrap">-{fmt(w.discount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50 border-t-2 border-amber-200">
                    <td className="px-4 py-3 font-black text-stone-800">JAMI</td>
                    <td className="px-4 py-3 font-black">{monthly.orders.length}</td>
                    <td className="px-4 py-3 font-black text-amber-700">{fmt(monthly.totalRevenue)}</td>
                    <td className="px-4 py-3 font-black text-teal-700">{fmt(monthly.totalProfit)}</td>
                    <td className="px-4 py-3 font-black text-rose-600">-{fmt(monthly.totalDiscount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {monthly.topProducts.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-black text-stone-800">Top 10 mahsulotlar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 text-xs text-stone-500 uppercase border-b border-stone-100">
                    <tr>
                      {['#', 'Mahsulot', 'Sotildi (ta)', 'Daromad'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-black">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {monthly.topProducts.map((p, i) => (
                      <tr key={i} className="hover:bg-amber-50/20">
                        <td className="px-4 py-3 font-black text-stone-400 text-sm">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-stone-800 text-sm">{p.name}</td>
                        <td className="px-4 py-3 font-black text-stone-700">{p.qty} ta</td>
                        <td className="px-4 py-3 font-black text-amber-600 whitespace-nowrap">{fmt(p.revenue)} so'm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Object.keys(monthly.cityStats).length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-black text-stone-800">Viloyatlar bo'yicha</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 text-xs text-stone-500 uppercase border-b border-stone-100">
                    <tr>
                      {['Viloyat', 'Zakazlar soni'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-black">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {Object.entries(monthly.cityStats).sort((a, b) => b[1] - a[1]).map(([city, cnt]) => (
                      <tr key={city} className="hover:bg-amber-50/20">
                        <td className="px-4 py-3 font-semibold text-stone-700">{city}</td>
                        <td className="px-4 py-3 font-black text-stone-900">{cnt} ta</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-order profit */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="font-black text-stone-800">Har bir zakaz bo'yicha foyda</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase border-b border-stone-100">
              <tr>
                {['Zakaz', 'Mijoz', 'Sana', 'Daromad', 'Chegirma', 'Foyda'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {report.orders?.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-stone-400 text-sm">Zakaz yo'q</td></tr>
              ) : (report.orders || []).slice(0, 50).map(o => {
                const profit = calcProfit(o.items || []);
                const disc = calcDiscount(o.items || []);
                return (
                  <tr key={o.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-black text-amber-700">{o.order_number}</td>
                    <td className="px-4 py-3 text-sm font-bold text-stone-800">{o.customer_name}</td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3 font-black text-amber-600 whitespace-nowrap">{fmt(o.total)} so'm</td>
                    <td className="px-4 py-3 font-black text-rose-500 whitespace-nowrap">{disc > 0 ? `-${fmt(disc)}` : '—'}</td>
                    <td className="px-4 py-3 font-black whitespace-nowrap">
                      <span className={profit > 0 ? 'text-teal-600' : profit < 0 ? 'text-rose-500' : 'text-stone-400'}>
                        {profit !== 0 ? fmt(profit) + ' so\'m' : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
