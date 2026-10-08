import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminStats } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import styles from './Panel.module.css';

export function RoutesChart({ routes }: { routes: AdminStats['topRoutes'] }) {
  const { t } = useLanguage();

  return (
    <section className={styles.panel}>
      <h3 className={styles.title}>{t('admin.popularRoutes')}</h3>
      {routes.length === 0 ? (
        <p className={styles.empty}>{t('admin.noRoutes')}</p>
      ) : (
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routes} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
              <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, border: 'none', fontWeight: 600 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {routes.map((route, index) => (
                  <Cell key={route.route} fill={index === 0 ? '#5b6af0' : '#a5b4fc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
