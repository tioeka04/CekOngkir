import { Package } from 'lucide-react';
import type { ShippingOption } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import { getCourierLogo } from '../../utils/courier';
import { formatRupiah } from '../../utils/format';
import styles from './CourierRow.module.css';

export function CourierRow({ option }: { option: ShippingOption }) {
  const { t } = useLanguage();
  const logo = getCourierLogo(option.courier);

  return (
    <li className={styles.row}>
      <div className={styles.logo}>
        {logo ? <img src={logo} alt={option.courier} /> : <Package size={24} color="var(--primary)" />}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{option.courier}</div>
        <div className={styles.meta}>
          {option.service}
          {option.etd && ` • ${t('shipping.estimate', { etd: option.etd })}`}
        </div>
      </div>
      <div className={styles.price}>{formatRupiah(option.cost)}</div>
    </li>
  );
}
