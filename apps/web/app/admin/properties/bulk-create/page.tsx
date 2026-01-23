'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthGuard';
import { useToast } from '../components/ToastContainer';
import styles from '../admin.module.css';

const EMPTY_TEMPLATE = {
  title: '',
  price: '',
  price_per_sqm: '',
  address: 'Сочи, ',
  latitude: 43.5855,
  longitude: 39.7231,
  description: '',
  area_sqm: '',
  rooms: '',
  total_floors: '',
  complex_name: '',
  district: 'Центральный',
  quality_score: 95,
  images: [] as string[],
  badges: [] as string[],
  features: {},
  is_active: true,
  // Developer Properties
  property_type: 'newbuild',
  layout_type: 'Свободная',
  finishing_type: 'Черновая',
  completion_date: '',
  is_from_developer: true,
  developer_name: '',
  developer_comment: '',
};

// Reusable components
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className={styles.formLabel}>{children}</label>
);

const Input = ({ 
  value, 
  onChange, 
  type = 'text',
  placeholder = '',
  error = ''
}: { 
  value: string | number; 
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) => (
  <div>
    <input 
      type={type}
      value={value} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
    />
    {error && <span className={styles.formError}>{error}</span>}
  </div>
);

export default function BulkCreatePage() {
  const { authFetch } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [template, setTemplate] = useState(EMPTY_TEMPLATE);
  const [floorFrom, setFloorFrom] = useState('2');
  const [floorTo, setFloorTo] = useState('10');
  const [apartmentsPerFloor, setApartmentsPerFloor] = useState('1');
  const [priceIncrement, setPriceIncrement] = useState('100000');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ created_count: number; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Calculate preview
  const totalFloors = Math.max(0, Number(floorTo) - Number(floorFrom) + 1);
  const totalApartments = totalFloors * Number(apartmentsPerFloor);
  const maxPrice = Number(template.price) + (totalFloors - 1) * Number(priceIncrement);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template.title || !template.price || !template.area_sqm) {
      showError('Заполните обязательные поля: Название, Цена, Площадь');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        template: {
          ...template,
          price: Number(template.price),
          price_per_sqm: template.price_per_sqm ? Number(template.price_per_sqm) : null,
          area_sqm: Number(template.area_sqm),
          total_floors: template.total_floors ? Number(template.total_floors) : Number(floorTo),
        },
        floor_from: Number(floorFrom),
        floor_to: Number(floorTo),
        apartments_per_floor: Number(apartmentsPerFloor),
        price_increment_per_floor: Number(priceIncrement),
      };

      const response = await authFetch(`${API_URL}/api/v1/properties/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        showSuccess(`Создано ${data.created_count} объектов!`);
      } else {
        const error = await response.json();
        showError(error.detail || 'Ошибка при создании');
      }
    } catch (error) {
      console.error('Bulk create error:', error);
      showError('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>🏗️ Массовое создание квартир</h1>
        <p className={styles.adminSubtitle}>
          Создайте несколько квартир для новостройки одним действием
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Preview Card */}
        <div className={styles.previewCard}>
          <div className={styles.previewTitle}>📊 Превью</div>
          <div className={styles.previewGrid}>
            <div>
              <span className={styles.previewLabel}>Этажи</span>
              <span className={styles.previewValue}>{floorFrom} — {floorTo}</span>
            </div>
            <div>
              <span className={styles.previewLabel}>Квартир на этаж</span>
              <span className={styles.previewValue}>{apartmentsPerFloor}</span>
            </div>
            <div>
              <span className={styles.previewLabel}>Всего объектов</span>
              <span className={styles.previewValueLarge}>{totalApartments}</span>
            </div>
            <div>
              <span className={styles.previewLabel}>Цена от — до</span>
              <span className={styles.previewValue}>
                {Number(template.price || 0).toLocaleString('ru-RU')} — {maxPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Floor Range */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>📐 Диапазон этажей</h3>
          <div className={styles.formGrid4}>
            <div>
              <Label>Этаж от</Label>
              <Input type="number" value={floorFrom} onChange={setFloorFrom} />
            </div>
            <div>
              <Label>Этаж до</Label>
              <Input type="number" value={floorTo} onChange={setFloorTo} />
            </div>
            <div>
              <Label>Квартир на этаж</Label>
              <Input type="number" value={apartmentsPerFloor} onChange={setApartmentsPerFloor} />
            </div>
            <div>
              <Label>Надбавка за этаж (₽)</Label>
              <Input type="number" value={priceIncrement} onChange={setPriceIncrement} placeholder="100000" />
            </div>
          </div>
        </div>

        {/* Template Data */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>📝 Шаблон квартиры</h3>
          <div className={styles.formGrid2}>
            <div>
              <Label>Название *</Label>
              <Input 
                value={template.title} 
                onChange={v => setTemplate({...template, title: v})} 
                placeholder="ЖК Лестория, 2-комн." 
              />
            </div>
            <div>
              <Label>ЖК</Label>
              <Input 
                value={template.complex_name} 
                onChange={v => setTemplate({...template, complex_name: v})} 
                placeholder="ЖК Лестория" 
              />
            </div>
          </div>
          <div className={styles.formGrid3}>
            <div>
              <Label>Базовая цена (₽) *</Label>
              <Input 
                type="number"
                value={template.price} 
                onChange={v => setTemplate({...template, price: v})} 
                placeholder="15000000" 
              />
            </div>
            <div>
              <Label>Площадь (м²) *</Label>
              <Input 
                type="number"
                value={template.area_sqm} 
                onChange={v => setTemplate({...template, area_sqm: v})} 
                placeholder="65" 
              />
            </div>
            <div>
              <Label>Комнат</Label>
              <Input 
                value={template.rooms} 
                onChange={v => setTemplate({...template, rooms: v})} 
                placeholder="2" 
              />
            </div>
          </div>
          <div className={styles.formGrid2}>
            <div>
              <Label>Адрес</Label>
              <Input 
                value={template.address} 
                onChange={v => setTemplate({...template, address: v})} 
                placeholder="Сочи, ул. Ленина, 1" 
              />
            </div>
            <div>
              <Label>Застройщик</Label>
              <Input 
                value={template.developer_name} 
                onChange={v => setTemplate({...template, developer_name: v})} 
                placeholder="ГК Неометрия" 
              />
            </div>
          </div>
          <div className={styles.formGrid4}>
            <div>
              <Label>Планировка</Label>
              <select 
                value={template.layout_type}
                onChange={e => setTemplate({...template, layout_type: e.target.value})}
                className={styles.formSelect}
              >
                <option value="Свободная">Свободная</option>
                <option value="Фиксированная">Фиксированная</option>
                <option value="Студия">Студия</option>
                <option value="Евро">Евро</option>
              </select>
            </div>
            <div>
              <Label>Отделка</Label>
              <select 
                value={template.finishing_type}
                onChange={e => setTemplate({...template, finishing_type: e.target.value})}
                className={styles.formSelect}
              >
                <option value="Черновая">Черновая</option>
                <option value="Предчистовая">Предчистовая</option>
                <option value="Чистовая">Чистовая / Под ключ</option>
                <option value="Дизайнерская">Дизайнерская</option>
              </select>
            </div>
            <div>
              <Label>Срок сдачи</Label>
              <Input 
                value={template.completion_date} 
                onChange={v => setTemplate({...template, completion_date: v})} 
                placeholder="4 кв. 2025" 
              />
            </div>
            <div>
              <Label>Район</Label>
              <Input 
                value={template.district} 
                onChange={v => setTemplate({...template, district: v})} 
                placeholder="Центральный" 
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.formActions}>
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.btnPrimary}
          >
            {isLoading ? '⏳ Создание...' : `🚀 Создать ${totalApartments} объектов`}
          </button>
          <a href="/admin/properties" className={styles.btnSecondary}>
            ← К списку объектов
          </a>
        </div>

        {/* Result */}
        {result && (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <div className={styles.successText}>{result.message}</div>
            <a href="/admin/properties" className={styles.btnPrimary}>
              Открыть список объектов
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
