'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Custom tooltip for financial data
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-stone-200 rounded-lg shadow-lg">
        <p className="font-semibold text-stone-800">{`Mois: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value.toLocaleString()}€`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Performance Chart Component
export const PerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#059669' }}
          name="Chiffre d'Affaires"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          strokeWidth={3}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#dc2626' }}
          name="Charges"
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#2563eb' }}
          name="Bénéfice Net"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Revenue vs Expenses Bar Chart
export const RevenueExpenseBarChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#10b981" 
          radius={[4, 4, 0, 0]}
          name="Chiffre d'Affaires"
        />
        <Bar 
          dataKey="expenses" 
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
          name="Charges"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Expense Breakdown Pie Chart
export const ExpensePieChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString()}€`, 'Montant']}
        />
        <Legend 
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ right: -20 }}
          formatter={(value, entry: any) => (
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Profit Margin Area Chart
export const ProfitMarginChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, 'Marge']}
          labelFormatter={(label) => `Mois: ${label}`}
        />
        <Area 
          type="monotone" 
          dataKey="margin" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorMargin)" 
          name="Marge Bénéficiaire"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Monthly Comparison Chart
export const MonthlyComparisonChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString()}€`, 'Montant']}
        />
        <Legend />
        <Bar 
          dataKey="thisYear" 
          fill="#10b981" 
          radius={[4, 4, 0, 0]}
          name="Cette Année"
        />
        <Bar 
          dataKey="lastYear" 
          fill="#6b7280" 
          radius={[4, 4, 0, 0]}
          name="Année Dernière"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};