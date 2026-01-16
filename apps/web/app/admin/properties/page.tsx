'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthGuard';
import LocationPicker from '../components/LocationPicker';
import ImageGalleryEditor from '../components/ImageGalleryEditor';
import JsonListEditor from '../components/JsonListEditor';
import styles from '../admin.module.css';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  area_sqm: number;
  rooms: string;
  images: string[];
  complex_name: string;
  district: string;
  is_active: boolean;
  created_at: string;
}

interface PropertyListResponse {
  items: Property[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const EMPTY_FORM = {
  title: '',
  price: '',
  address: 'Сочи, Центр',
  latitude: 43.5855,
  longitude: 39.7231,
  description: '',
  area_sqm: '',
  rooms: '2',
  floor: '',
  total_floors: '',
  complex_name: '',
  district: 'Центральный',
  quality_score: 95,
  images: [] as string[],
  badges: [] as string[],
  features: {} as Record<string, string>,
  is_active: true,
  investment_metrics: { roi: 14, growth_10y: 127, sale_time: 22 },
  growth_forecasts: [] as any[],
  development_projects: [] as any[],
  eco_score: { air: 5, noise: 4, green: 5 },
  green_zones: [] as any[],
  owner_quote: '',
  owner_name: '',
  agent_profile: { name: 'Анна Петрова', role: 'Эксперт', photo: '' }
};

export default function AdminProperties() {
  const { authFetch } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Загрузка списка объектов
  const fetchProperties = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/v1/properties?page=${page}&size=10`);
      if (response.ok) {
        const data: PropertyListResponse = await response.json();
        setProperties(data.items);
        setTotalPages(data.pages);
        setCurrentPage(data.page);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Загрузка объекта для редактирования
  const loadPropertyForEdit = async (id: string) => {
    try {
      const response = await authFetch(`${API_URL}/api/v1/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          price: String(data.price) || '',
          address: data.address || '',
          latitude: data.latitude || 43.5855,
          longitude: data.longitude || 39.7231,
          description: data.description || '',
          area_sqm: String(data.area_sqm) || '',
          rooms: data.rooms || '',
          floor: String(data.floor || ''),
          total_floors: String(data.total_floors || ''),
          complex_name: data.complex_name || '',
          district: data.district || '',
          quality_score: data.quality_score || 95,
          images: data.images || [],
          badges: data.badges || [],
          features: data.features || {},
          is_active: data.is_active !== false,
          investment_metrics: data.investment_metrics || EMPTY_FORM.investment_metrics,
          growth_forecasts: data.growth_forecasts || [],
          development_projects: data.development_projects || [],
          eco_score: data.eco_score || EMPTY_FORM.eco_score,
          green_zones: data.green_zones || [],
          owner_quote: data.owner_quote || '',
          owner_name: data.owner_name || '',
          agent_profile: data.agent_profile || EMPTY_FORM.agent_profile,
        });
        setEditingId(id);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки объекта:', error);
    }
  };

  // Удаление объекта
  const deleteProperty = async (id: string) => {
    if (!confirm('Удалить этот объект?')) return;
    
    try {
      const response = await authFetch(`${API_URL}/api/v1/properties/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProperties(currentPage);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Сохранение (создание или обновление)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        area_sqm: Number(formData.area_sqm) || 0,
        floor: formData.floor ? Number(formData.floor) : null,
        total_floors: formData.total_floors ? Number(formData.total_floors) : null,
      };

      const url = editingId 
        ? `${API_URL}/api/v1/properties/${editingId}`
        : `${API_URL}/api/v1/properties`;
      
      const response = await authFetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setShowForm(false);
          setEditingId(null);
          setFormData(EMPTY_FORM);
          fetchProperties(currentPage);
        }, 1500);
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const updateNested = (key: string, subkey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev as any)[key], [subkey]: value }
    }));
  };

  const handleNewProperty = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  // Фильтрация по поиску
  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.complex_name && p.complex_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ₽`;
    }
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  // === ФОРМА РЕДАКТИРОВАНИЯ ===
  if (showForm) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-[32px] font-bold text-white">
              {editingId ? 'Редактирование объекта' : 'Новый объект'}
            </h1>
            <p className="text-slate-500">Полный контроль над контентом, аналитикой и медиа</p>
          </div>
          <button 
            onClick={handleCancel}
            className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Назад к списку
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_400px] gap-10 items-start">
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* 1. БАЗОВАЯ ИНФОРМАЦИЯ */}
              <Section title="📑 Базовая информация">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                          <Label>Название объекта / Заголовок</Label>
                          <Input 
                              value={formData.title} 
                              onChange={v => setFormData({...formData, title: v})} 
                              placeholder="Видовые апартаменты в Сириусе" 
                          />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                              <Label>Цена (₽)</Label>
                              <Input 
                                  type="number" 
                                  value={formData.price} 
                                  onChange={v => setFormData({...formData, price: v})} 
                              />
                          </div>
                          <div>
                              <Label>Жилой Комплекс</Label>
                              <Input 
                                  value={formData.complex_name} 
                                  onChange={v => setFormData({...formData, complex_name: v})} 
                                  placeholder="ЖК Актер Гэлакси" 
                              />
                          </div>
                      </div>
                      <div>
                          <Label>Описание объекта</Label>
                          <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full h-[120px] p-3 bg-white/5 border border-white/10 rounded-lg text-white resize-y"
                              placeholder="Эксклюзивная резиденция с панорамным видом на море. Премиальная отделка, закрытая территория, консьерж-сервис 24/7..."
                          />
                      </div>
                  </div>
              </Section>

              {/* 2. ХАРАКТЕРИСТИКИ */}
              <Section title="📏 Характеристики">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div>
                          <Label>Площадь (м²)</Label>
                          <Input type="number" value={formData.area_sqm} onChange={v => setFormData({...formData, area_sqm: v})} />
                      </div>
                      <div>
                          <Label>Комнат</Label>
                          <Input value={formData.rooms} onChange={v => setFormData({...formData, rooms: v})} />
                      </div>
                      <div>
                          <Label>Этаж</Label>
                          <Input type="number" value={formData.floor} onChange={v => setFormData({...formData, floor: v})} />
                      </div>
                      <div>
                          <Label>Всего этажей</Label>
                          <Input type="number" value={formData.total_floors} onChange={v => setFormData({...formData, total_floors: v})} />
                      </div>
                  </div>
              </Section>

              {/* 3. КАРТА */}
              <Section title="📍 Локация на карте">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Input 
                          value={formData.address} 
                          onChange={v => setFormData({...formData, address: v})} 
                          placeholder="Введите адрес для отображения"
                      />
                      <LocationPicker 
                          initialLat={formData.latitude} 
                          initialLon={formData.longitude}
                          onChange={(lat, lon) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }))} 
                      />
                   </div>
              </Section>

              {/* 4. ГАЛЕРЕЯ */}
              <ImageGalleryEditor 
                  images={formData.images} 
                  onChange={imgs => setFormData({...formData, images: imgs})} 
              />

              {/* 5. ХАРАКТЕРИСТИКИ ОБЪЕКТА */}
              <Section title="✨ Особенности объекта">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                              <Label>Вид</Label>
                              <select 
                                  aria-label="Вид"
                                  value={formData.features?.['Вид'] || ''}
                                  onChange={e => setFormData({...formData, features: {...formData.features, 'Вид': e.target.value}})}
                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                              >
                                  <option value="">Не указан</option>
                                  <option value="Море">Море</option>
                                  <option value="Горы">Горы</option>
                                  <option value="Панорама">Панорама</option>
                                  <option value="Город">Город</option>
                                  <option value="Парк">Парк</option>
                              </select>
                          </div>
                          <div>
                              <Label>Терраса</Label>
                              <Input value={formData.features?.['Терраса'] || ''} onChange={v => setFormData({...formData, features: {...formData.features, 'Терраса': v}})} placeholder="45 м²" />
                          </div>
                          <div>
                              <Label>Паркинг</Label>
                              <Input value={formData.features?.['Паркинг'] || ''} onChange={v => setFormData({...formData, features: {...formData.features, 'Паркинг': v}})} placeholder="2 места" />
                          </div>
                          <div>
                              <Label>Отделка</Label>
                              <select 
                                  aria-label="Отделка"
                                  value={formData.features?.['Отделка'] || ''}
                                  onChange={e => setFormData({...formData, features: {...formData.features, 'Отделка': e.target.value}})}
                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                              >
                                  <option value="">Не указана</option>
                                  <option value="Премиум">Премиум</option>
                                  <option value="Дизайнерская">Дизайнерская</option>
                                  <option value="Под ключ">Под ключ</option>
                                  <option value="Черновая">Черновая</option>
                              </select>
                          </div>
                          <div>
                              <Label>Высота потолков</Label>
                              <Input value={formData.features?.['Потолки'] || ''} onChange={v => setFormData({...formData, features: {...formData.features, 'Потолки': v}})} placeholder="3.2 м" />
                          </div>
                          <div>
                              <Label>Бассейн</Label>
                              <select 
                                  aria-label="Бассейн"
                                  value={formData.features?.['Бассейн'] || ''}
                                  onChange={e => setFormData({...formData, features: {...formData.features, 'Бассейн': e.target.value}})}
                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                              >
                                  <option value="">Нет</option>
                                  <option value="Rooftop">Rooftop</option>
                                  <option value="Крытый">Крытый</option>
                                  <option value="Открытый">Открытый</option>
                                  <option value="Частный">Частный</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </Section>

              {/* 6. БЕЙДЖИ */}
              <Section title="🏷️ Бейджи и теги">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['Эксклюзив', 'Sea View', 'Люкс', 'Новостройка', 'Первая линия', 'Rooftop', 'SPA', 'Консьерж 24/7', 'Закрытая территория', 'Смарт-дом'].map(badge => (
                          <button
                              key={badge}
                              type="button"
                              onClick={() => {
                                  const current = formData.badges || [];
                                  if (current.includes(badge)) {
                                      setFormData({...formData, badges: current.filter(b => b !== badge)});
                                  } else {
                                      setFormData({...formData, badges: [...current, badge]});
                                  }
                              }}

                              className={`${styles.badge} ${
                                formData.badges?.includes(badge) ? styles.badgeActive : styles.badgeDefault
                              }`}
                          >
                              {formData.badges?.includes(badge) ? '✓ ' : ''}{badge}
                          </button>
                      ))}
                  </div>
              </Section>

              {/* 7. ИНВЕСТИЦИИ */}
              <Section title="💎 Инвестиционный Потенциал">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                           <div>
                              <Label>ROI Годовой (%)</Label>
                              <Input type="number" value={formData.investment_metrics.roi} onChange={v => updateNested('investment_metrics', 'roi', v)} />
                          </div>
                           <div>
                              <Label>Рост за 10 лет (%)</Label>
                              <Input type="number" value={formData.investment_metrics.growth_10y} onChange={v => updateNested('investment_metrics', 'growth_10y', v)} />
                          </div>
                           <div>
                              <Label>Срок продажи (дней)</Label>
                              <Input type="number" value={formData.investment_metrics.sale_time} onChange={v => updateNested('investment_metrics', 'sale_time', v)} />
                          </div>
                      </div>
                      
                      <JsonListEditor 
                          title="📊 Прогноз роста по годам"
                          items={formData.growth_forecasts}
                          fields={[
                              { key: 'year', label: 'Период', type: 'text' },
                              { key: 'value', label: 'Рост %', type: 'number' }
                          ]}
                          onChange={items => setFormData({...formData, growth_forecasts: items})}
                      />

                      <JsonListEditor 
                          title="🏗️ Инфраструктурные проекты района"
                          items={formData.development_projects}
                          fields={[
                              { key: 'name', label: 'Название проекта', type: 'text' },
                              { key: 'year', label: 'Год', type: 'text' },
                              { key: 'status', label: 'Статус', type: 'text' }
                          ]}
                          onChange={items => setFormData({...formData, development_projects: items})}
                      />
                  </div>
              </Section>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'sticky', top: '24px' }}>
              
              {/* ЭКОЛОГИЯ */}
              <Section title="🌿 Окружение (1-5)">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                          <Label>Воздух</Label>
                          <Input type="number" value={formData.eco_score.air} onChange={v => updateNested('eco_score', 'air', v)} />
                      </div>
                      <div>
                          <Label>Тишина</Label>
                          <Input type="number" value={formData.eco_score.noise} onChange={v => updateNested('eco_score', 'noise', v)} />
                      </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                      <JsonListEditor 
                          title="🌳 Зеленые зоны / Парки"
                          items={formData.green_zones}
                          fields={[
                              { key: 'name', label: 'Название', type: 'text' },
                              { key: 'dist', label: 'Расстояние', type: 'text' }
                          ]}
                          onChange={items => setFormData({...formData, green_zones: items})}
                      />
                  </div>
              </Section>

              {/* АГЕНТ */}
              <Section title="👤 Персонализация">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                          <Label>Имя агента</Label>
                          <Input value={formData.agent_profile.name} onChange={v => updateNested('agent_profile', 'name', v)} />
                      </div>
                      <div>
                          <Label>Цитата собственника</Label>
                           <textarea 
                               value={formData.owner_quote}
                               onChange={e => setFormData({...formData, owner_quote: e.target.value})}
                               className="w-full h-20 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                               placeholder="Продаю в связи с переездом..."
                          />
                      </div>
                  </div>
              </Section>

              {/* ПУБЛИКАЦИЯ */}
              <Section title="🚀 Публикация">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                              <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Статус публикации</div>
                              <div style={{ fontSize: '13px', color: '#64748b' }}>
                                  {formData.is_active ? 'Объект виден на сайте' : 'Объект скрыт от посетителей'}
                              </div>
                          </div>
                          <button
                              type="button"
                              aria-label="Переключить статус публикации"
                              onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                              className={`w-[60px] h-8 rounded-[16px] border-none relative cursor-pointer transition-colors ${
                                formData.is_active ? 'bg-[#22c55e]' : 'bg-white/20'
                              }`}
                          >
                              <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-md ${
                                formData.is_active ? 'left-8' : 'left-1'
                              }`} />
                          </button>
                      </div>
                      
                      {editingId && (
                          <a 
                              href={`/properties/${editingId}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '12px',
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  color: '#3b82f6',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  fontSize: '14px'
                              }}
                          >
                              👁️ Предпросмотр на сайте
                          </a>
                      )}
                  </div>
              </Section>

              <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className={`w-full p-5 bg-[#d4af37] text-black rounded-xl border-none font-extrabold cursor-pointer text-lg shadow-[0_8px_24px_rgba(212,175,55,0.3)] transition-all ${
                    status === 'loading' ? 'opacity-70' : 'hover:bg-[#e5bd3d]'
                  }`}
              >
                  {status === 'loading' ? '⏳ Сохраняю...' : editingId ? '💾 Сохранить изменения' : '🚀 Опубликовать объект'}
              </button>

              {status === 'success' && (
                  <div className="p-4 bg-[#22c55e] text-white rounded-lg text-center font-semibold">
                      ✅ {editingId ? 'Объект обновлен!' : 'Объект создан!'}
                  </div>
              )}
              {status === 'error' && (
                  <div className="p-4 bg-[#dc2626] text-white rounded-lg text-center font-semibold">
                      ❌ Ошибка сохранения
                  </div>
              )}
          </div>
        </form>
      </div>
    );
  }

  // === СПИСОК ОБЪЕКТОВ ===
  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-white">Объекты недвижимости</h1>
          <p className="text-slate-500">Всего объектов: {properties.length}</p>
        </div>
        <button 
          onClick={handleNewProperty}
          className="px-6 py-3 bg-[#d4af37] text-black rounded-xl border-none font-bold cursor-pointer text-base flex items-center gap-2 hover:bg-[#e5bd3d] transition-colors"
        >
          ➕ Добавить объект
        </button>
      </header>

      {/* Поиск */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Поиск по названию, адресу или ЖК..."
          className="w-full max-w-[400px] p-3 px-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        />
      </div>

      {/* Таблица */}
      {isLoading ? (
        <div className="text-center p-12 text-slate-500">
          ⏳ Загрузка объектов...
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center p-12 text-slate-500">
          <div className="text-5xl mb-4">🏠</div>
          <p>Объекты не найдены</p>
          <button 
            onClick={handleNewProperty}
            className="mt-4 px-5 py-2.5 bg-[#d4af37] text-black rounded-lg border-none cursor-pointer font-semibold hover:bg-[#e5bd3d]"
          >
            Создать первый объект
          </button>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 text-left text-slate-400 font-semibold text-[13px]">Фото</th>
                <th className="p-4 text-left text-slate-400 font-semibold text-[13px]">Название</th>
                <th className="p-4 text-left text-slate-400 font-semibold text-[13px]">Адрес</th>
                <th className="p-4 text-left text-slate-400 font-semibold text-[13px]">Цена</th>
                <th className="p-4 text-left text-slate-400 font-semibold text-[13px]">Площадь</th>
                <th className="p-4 text-center text-slate-400 font-semibold text-[13px]">Статус</th>
                <th className="p-4 text-center text-slate-400 font-semibold text-[13px]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr 
                  key={property.id} 
                  className="border-t border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="p-3 px-4">
                    <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🏠</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 px-4">
                    <div className="text-white font-semibold mb-1">{property.title}</div>
                    {property.complex_name && (
                      <div className="text-slate-500 text-xs">{property.complex_name}</div>
                    )}
                  </td>
                  <td className="p-3 px-4 text-slate-400">{property.address}</td>
                  <td className="p-3 px-4 text-[#d4af37] font-semibold">{formatPrice(property.price)}</td>
                  <td className="p-3 px-4 text-slate-400">{property.area_sqm} м²</td>
                  <td className="p-3 px-4 text-center">
                    <span className={`padding-1 px-3 py-1 rounded-xl text-xs font-semibold ${
                      property.is_active ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {property.is_active ? '● Активен' : '○ Скрыт'}
                    </span>
                  </td>
                  <td className="p-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => loadPropertyForEdit(property.id)}
                        className="px-3 py-2 bg-blue-500/20 text-blue-500 rounded-md border-none cursor-pointer text-[13px] hover:bg-blue-500/30 transition-colors"
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => deleteProperty(property.id)}
                        aria-label="Удалить"
                        className="px-3 py-2 bg-red-600/20 text-red-600 rounded-md border-none cursor-pointer text-[13px] hover:bg-red-600/30 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => fetchProperties(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ 
              padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', 
              borderRadius: '6px', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => fetchProperties(page)}
              style={{ 
                padding: '8px 16px', 
                background: page === currentPage ? '#d4af37' : 'rgba(255,255,255,0.1)', 
                color: page === currentPage ? '#000' : '#fff', 
                borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => fetchProperties(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ 
              padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', 
              borderRadius: '6px', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

// UI HELPER COMPONENTS
import styles from '../admin.module.css';

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    const icon = title.includes('📑') ? '📑' : 
                 title.includes('📏') ? '📏' :
                 title.includes('📍') ? '📍' :
                 title.includes('🖼️') ? '🖼️' :
                 title.includes('✨') ? '✨' :
                 title.includes('🏷️') ? '🏷️' :
                 title.includes('💎') ? '💎' :
                 title.includes('🌿') ? '🌿' :
                 title.includes('👤') ? '👤' :
                 title.includes('🚀') ? '🚀' : '';
    
    const cleanTitle = title.replace(/📑|📏|📍|🖼️|✨|🏷️|💎|🌿|👤|🚀/g, '').trim();
    
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
                {icon && <span className={styles.sectionIcon}>{icon}</span>}
                <h3 className={styles.sectionTitle}>{cleanTitle}</h3>
            </div>
            {children}
        </div>
    );
}

function Label({ children, required }: { children: React.ReactNode, required?: boolean }) {
    return (
        <label className={`${styles.inputLabel} ${required ? styles.inputLabelRequired : ''}`}>
            {children}
        </label>
    );
}

function Input({ onChange, label, required, helper, error, ...props }: { 
    onChange: (val: string) => void;
    label?: string;
    required?: boolean;
    helper?: string;
    error?: string;
} & Record<string, any>) {
    const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasValue = props.value && props.value.toString().length > 0;
    
    return (
        <div style={{ width: '100%' }}>
            {label && <Label required={required}>{label}</Label>}
            <div className={styles.formInputWrapper}>
                <input 
                    id={inputId}
                    {...props} 
                    onChange={e => onChange(e.target.value)}
                    className={styles.formInput}
                    placeholder=" "
                />
            </div>
            {helper && !error && <div className={styles.helperText}>{helper}</div>}
            {error && <div className={`${styles.helperText} ${styles.helperTextError}`}>{error}</div>}
        </div>
    );
}

