'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthGuard';
import { useToast } from '../components/ToastContainer';
import LocationPicker from '../components/LocationPicker';
import ImageGalleryEditor from '../components/ImageGalleryEditor';
import { VideoEditor } from '../components/VideoEditor';
import JsonListEditor from '../components/JsonListEditor';
import TextareaWithCounter from '../components/TextareaWithCounter';
import styles from '../admin.module.css';
import { geocodeAddress, reverseGeocode } from '../../utils/geocoder';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  area_sqm: number;
  rooms: string | null;
  images: string[];
  complex_name: string | null;
  district: string | null;
  is_active: boolean;
  created_at?: string;
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
  price_per_sqm: '',
  address: 'Сочи, Центр',
  latitude: 43.5855,
  longitude: 39.7231,
  description: '',
  area_sqm: '',
  rooms: '2',
  floor: '',
  total_floors: '',
  // Range fields (Complexes)
  area_min: '',
  area_max: '',
  rooms_min: '',
  rooms_max: '',
  floor_min: '',
  floor_max: '',
  complex_name: '',
  district: 'Центральный',
  quality_score: 95,
  images: [] as string[],
  videos: [] as string[],
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
  agent_profile: { name: 'Анна Петрова', role: 'Эксперт', photo: '' },
  // Developer Properties (Новостройки)
  property_type: 'apartment',
  layout_type: '',
  finishing_type: '',
  completion_date: '',
  is_from_developer: false,
  developer_name: '',
  developer_comment: '',
  custom_fields: {} as Record<string, string>,
  complex_id: null as number | null,
};

export default function AdminProperties() {
  const { authFetch } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Флаг, чтобы не триггерить геокодинг при ручном изменении координат
  const isManualUpdate = useRef(false);

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
          price_per_sqm: String(data.price_per_sqm || ''),
          address: data.address || '',
          latitude: data.latitude || 43.5855,
          longitude: data.longitude || 39.7231,
          description: data.description || '',
          area_sqm: String(data.area_sqm) || '',
          rooms: data.rooms || '',
          floor: String(data.floor || ''),
          total_floors: String(data.total_floors || ''),
          area_min: String(data.area_min || ''),
          area_max: String(data.area_max || ''),
          rooms_min: String(data.rooms_min || ''),
          rooms_max: String(data.rooms_max || ''),
          floor_min: String(data.floor_min || ''),
          floor_max: String(data.floor_max || ''),
          complex_name: data.complex_name || '',
          district: data.district || '',
          quality_score: data.quality_score || 95,
          images: data.images || [],
          videos: data.videos || [],
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
          // Developer Properties
          property_type: data.property_type || 'apartment',
          layout_type: data.layout_type || '',
          finishing_type: data.finishing_type || '',
          completion_date: data.completion_date || '',
          is_from_developer: data.is_from_developer || false,
          developer_name: data.developer_name || '',
          developer_comment: data.developer_comment || '',
          custom_fields: data.custom_fields || {},
          complex_id: data.complex_id || null,
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
        showSuccess('Объект успешно удалён');
        fetchProperties(currentPage);
      } else {
        showError('Ошибка при удалении объекта');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showError('Не удалось удалить объект');
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Название обязательно для заполнения';
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Укажите корректную цену';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Адрес обязателен для заполнения';
    }
    
    if (!formData.area_sqm || Number(formData.area_sqm) <= 0) {
      errors.area_sqm = 'Укажите корректную площадь';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Авто-геокодинг адреса
  useEffect(() => {
    // Не запускаем если форма скрыта или адрес пустой
    if (!showForm || !formData.address || formData.address.length < 5) return;
    
    // Если это ручное обновление (из карты), пропускаем прямой геокодинг
    if (isManualUpdate.current) {
        isManualUpdate.current = false;
        return;
    }

    // Не запускаем если координаты уже были установлены вручную (нужна логика, но пока просто при изменении адреса)
    // Дебаунс 1500мс
    const timer = setTimeout(async () => {
       const result = await geocodeAddress(formData.address);
       if (result) {
         setFormData(prev => ({
            ...prev,
            latitude: result.lat,
            longitude: result.lng
         }));
         showSuccess(`Координаты обновлены: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`);
       }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.address, showForm]);

    // Обработчик изменения координат на карте (Обратный геокодинг)
    const handleMapLocationChange = async (lat: number, lon: number) => {
        // Устанавливаем флаг, что это ручное обновление, чтобы useEffect не сработал
        isManualUpdate.current = true;
        
        // Сразу обновляем координаты
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        
        // Запускаем обратный геокодинг
        const address = await reverseGeocode(lat, lon);
        if (address) {
            setFormData(prev => ({ ...prev, address: address }));
            showSuccess(`Адрес обновлен: ${address}`);
        }
    };

  // Сохранение (создание или обновление)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!validateForm()) {
      showWarning('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setStatus('loading');
    setValidationErrors({});

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        price_per_sqm: formData.price_per_sqm ? Number(formData.price_per_sqm) : null,
        area_sqm: Number(formData.area_sqm) || 0,
        floor: formData.floor ? Number(formData.floor) : null,
        total_floors: formData.total_floors ? Number(formData.total_floors) : null,
        area_min: formData.area_min ? Number(formData.area_min) : null,
        area_max: formData.area_max ? Number(formData.area_max) : null,
        rooms_min: formData.rooms_min ? Number(formData.rooms_min) : null,
        rooms_max: formData.rooms_max ? Number(formData.rooms_max) : null,
        floor_min: formData.floor_min ? Number(formData.floor_min) : null,
        floor_max: formData.floor_max ? Number(formData.floor_max) : null,
        // Developer Properties
        complex_id: formData.complex_id ? Number(formData.complex_id) : null,
      };

      const url = editingId 
        ? `${API_URL}/api/v1/properties/${editingId}`
        : `${API_URL}/api/v1/properties`;
      
      console.log('📤 Отправка данных:', { url, method: editingId ? 'PATCH' : 'POST', payload });
      
      const response = await authFetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Ответ сервера:', response.status, response.statusText);

      if (response.ok) {
        setStatus('success');
        showSuccess(editingId ? 'Объект успешно обновлён!' : 'Объект успешно создан!');
        // Мгновенный редирект на список объектов
        setShowForm(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        fetchProperties(1); // Переход на первую страницу чтобы увидеть новый объект
        setTimeout(() => setStatus('idle'), 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Ошибка API:', response.status, errorData);
        const errorMessage = errorData.detail || errorData.message || `Ошибка сервера: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('❌ Ошибка сохранения:', err);
      setStatus('error');
      showError(err.message || 'Не удалось сохранить объект. Проверьте подключение к серверу.');
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
      <div className={styles.adminMainContent}>
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-[32px] font-bold text-white">
              {editingId ? 'Редактирование объекта' : 'Новый объект'}
            </h1>
            <p className="text-slate-500">Полный контроль над контентом, аналитикой и медиа</p>
          </div>
          <button 
            onClick={handleCancel}
            className={styles.btnSecondary}
          >
            ← Назад к списку
          </button>
        </header>

        {/* Progress Bar */}
        {status === 'loading' && (
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_400px] gap-10 items-start">
          
          {/* LEFT COLUMN */}
          <div className={styles.formColumn}>
              
              {/* 1. БАЗОВАЯ ИНФОРМАЦИЯ */}
              <Section title="📑 Базовая информация">
                  <div className={styles.formStack}>
                      <div>
                          <Label>Название объекта / Заголовок</Label>
                          <Input 
                              value={formData.title} 
                              onChange={v => setFormData({...formData, title: v})} 
                              placeholder="Видовые апартаменты в Сириусе" 
                              error={validationErrors.title}
                          />
                      </div>
                      <div className={styles.formGrid3}>
                          <div>
                              <Label>Минимальная цена (₽)</Label>
                              <Input 
                                  type="number" 
                                  value={formData.price} 
                                  onChange={v => setFormData({...formData, price: v})} 
                                  error={validationErrors.price}
                                  placeholder="Напр. 15000000"
                              />
                          </div>
                          <div>
                              <Label>Цена за м² (₽)</Label>
                              <div className="flex gap-2">
                                <Input 
                                    type="number" 
                                    value={formData.price_per_sqm} 
                                    onChange={v => setFormData({...formData, price_per_sqm: v})} 
                                    placeholder="Напр. 350000"
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const p = Number(formData.price);
                                    const a = Number(formData.area_sqm) || Number(formData.area_min);
                                    if (p && a) {
                                      setFormData(prev => ({ ...prev, price_per_sqm: String(Math.round(p / a)) }));
                                    }
                                  }}
                                  className="px-3 bg-slate-800 text-white rounded hover:bg-slate-700 text-xs"
                                  title="Рассчитать из общей цены"
                                >
                                  🧮
                                </button>
                              </div>
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
                          <TextareaWithCounter 
                              value={formData.description}
                              onChange={v => setFormData({...formData, description: v})}
                              placeholder="Эксклюзивная резиденция с панорамным видом на море. Премиальная отделка, закрытая территория, консьерж-сервис 24/7..."
                              label="Описание объекта"
                              maxLength={2000}
                              helper="Подробное описание для лендинга объекта"
                              minHeight="140px"
                          />
                      </div>
                  </div>
              </Section>

              {/* 2. ХАРАКТЕРИСТИКИ */}
              <Section title="📏 Характеристики и Диапазоны (для ЖК)">
                  <div className={styles.formGrid4}>
                      <div>
                          <Label>Площадь (м²)</Label>
                          <Input 
                              type="number" 
                              value={formData.area_sqm} 
                              onChange={v => setFormData({...formData, area_sqm: v})} 
                              error={validationErrors.area_sqm}
                          />
                      </div>
                      <div>
                          <Label>Площадь от (м²)</Label>
                          <Input type="number" value={formData.area_min} onChange={v => setFormData({...formData, area_min: v})} />
                      </div>
                      <div>
                          <Label>Площадь до (м²)</Label>
                          <Input type="number" value={formData.area_max} onChange={v => setFormData({...formData, area_max: v})} />
                      </div>
                      <div>
                          <Label>Комнат</Label>
                          <Input value={formData.rooms} onChange={v => setFormData({...formData, rooms: v})} />
                      </div>
                  </div>

                  <div className={styles.formGrid4 + " mt-4"}>
                      <div>
                          <Label>Комнат от</Label>
                          <Input type="number" value={formData.rooms_min} onChange={v => setFormData({...formData, rooms_min: v})} />
                      </div>
                      <div>
                          <Label>Комнат до</Label>
                          <Input type="number" value={formData.rooms_max} onChange={v => setFormData({...formData, rooms_max: v})} />
                      </div>
                      <div>
                          <Label>Этаж от</Label>
                          <Input type="number" value={formData.floor_min} onChange={v => setFormData({...formData, floor_min: v})} />
                      </div>
                      <div>
                          <Label>Этаж до</Label>
                          <Input type="number" value={formData.floor_max} onChange={v => setFormData({...formData, floor_max: v})} />
                      </div>
                  </div>
                  
                  <div className={styles.formGrid2 + " mt-4"}>
                      <div>
                          <Label>Базовый этаж</Label>
                          <Input type="number" value={formData.floor} onChange={v => setFormData({...formData, floor: v})} />
                      </div>
                      <div>
                          <Label>Всего этажей</Label>
                          <Input type="number" value={formData.total_floors} onChange={v => setFormData({...formData, total_floors: v})} />
                      </div>
                  </div>
              </Section>

              {/* 2.5 НОВОСТРОЙКИ / ЗАСТРОЙЩИК */}
              <Section title="🏗️ Новостройка / Застройщик">
                  <div className={styles.formGrid4}>
                      <div>
                          <Label>Тип объекта</Label>
                          <select 
                              aria-label="Тип объекта"
                              value={formData.property_type}
                              onChange={e => setFormData({...formData, property_type: e.target.value})}
                              className={styles.formSelect}
                          >
                              <option value="apartment">Квартира</option>
                              <option value="newbuild">Новостройка</option>
                              <option value="cottage">Коттедж</option>
                              <option value="commercial">Коммерция</option>
                          </select>
                      </div>
                      <div>
                          <Label>Планировка</Label>
                          <select 
                              aria-label="Тип планировки"
                              value={formData.layout_type}
                              onChange={e => setFormData({...formData, layout_type: e.target.value})}
                              className={styles.formSelect}
                          >
                              <option value="">Не указана</option>
                              <option value="Свободная">Свободная</option>
                              <option value="Фиксированная">Фиксированная</option>
                              <option value="Студия">Студия</option>
                              <option value="Евро">Евро</option>
                          </select>
                      </div>
                      <div>
                          <Label>Отделка</Label>
                          <select 
                              aria-label="Тип отделки"
                              value={formData.finishing_type}
                              onChange={e => setFormData({...formData, finishing_type: e.target.value})}
                              className={styles.formSelect}
                          >
                              <option value="">Не указана</option>
                              <option value="Черновая">Черновая</option>
                              <option value="Предчистовая">Предчистовая</option>
                              <option value="Чистовая">Чистовая / Под ключ</option>
                              <option value="Дизайнерская">Дизайнерская</option>
                          </select>
                      </div>
                      <div>
                          <Label>Срок сдачи</Label>
                          <Input 
                              value={formData.completion_date} 
                              onChange={v => setFormData({...formData, completion_date: v})} 
                              placeholder="4 кв. 2025 / Сдан"
                          />
                      </div>
                  </div>
                  
                  <div className={styles.formGrid2 + " mt-4"}>
                      <div>
                          <Label>Застройщик</Label>
                          <Input 
                              value={formData.developer_name} 
                              onChange={v => setFormData({...formData, developer_name: v})} 
                              placeholder="ГК Неометрия"
                          />
                      </div>
                      <div className={styles.formRow}>
                          <div>
                              <div className={styles.formLabelBold}>От застройщика</div>
                              <div className={styles.formLabelSub}>
                                  {formData.is_from_developer ? 'Объект от застройщика' : 'Вторичка / Частное лицо'}
                              </div>
                          </div>
                          <button
                              type="button"
                              aria-label="Переключить От застройщика"
                              onClick={() => setFormData({...formData, is_from_developer: !formData.is_from_developer})}
                              className={`w-[60px] h-8 rounded-[16px] border-none relative cursor-pointer transition-colors ${
                                formData.is_from_developer ? 'bg-[#22c55e]' : 'bg-white/20'
                              }`}
                          >
                              <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-md ${
                                formData.is_from_developer ? 'left-8' : 'left-1'
                              }`} />
                          </button>
                      </div>
                  </div>

                  {formData.is_from_developer && (
                      <div className="mt-4">
                          <TextareaWithCounter 
                              value={formData.developer_comment}
                              onChange={v => setFormData({...formData, developer_comment: v})}
                              placeholder="Комментарий от представителя застройщика..."
                              label="Комментарий застройщика"
                              maxLength={1000}
                              helper="Вместо цитаты собственника для новостроек"
                              minHeight="100px"
                          />
                      </div>
                  )}
              </Section>

              {/* 3. КАРТА */}
              <Section title="📍 Локация на карте">
                      <div>
                          <Input 
                              value={formData.address} 
                              onChange={v => setFormData({...formData, address: v})} 
                              placeholder="Введите адрес для отображения"
                              error={validationErrors.address}
                          />
                          <LocationPicker 
                              initialLat={formData.latitude} 
                              initialLon={formData.longitude}
                              onChange={handleMapLocationChange} 
                          />
                   </div>
              </Section>

              {/* 4. ГАЛЕРЕЯ */}
              <ImageGalleryEditor 
                  images={formData.images} 
                  onChange={imgs => setFormData({...formData, images: imgs})} 
              />

              {/* 5. ВИДЕО */}
              <VideoEditor 
                  videos={formData.videos} 
                  onChange={vids => setFormData({...formData, videos: vids})} 
              />

              <Section title="✨ Особенности объекта">
                  <div className={styles.formStackSmall}>
                      <div className={styles.formGrid2}>
                          <div>
                              <Label>Вид</Label>
                              <select 
                                  aria-label="Вид"
                                  value={formData.features?.['Вид'] || ''}
                                  onChange={e => setFormData({...formData, features: {...formData.features, 'Вид': e.target.value}})}
                                  className={styles.formSelect}
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
                                  className={styles.formSelect}
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
                                  className={styles.formSelect}
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
                  <div className={styles.badgesGrid}>
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

              <Section title="💎 Инвестиционный Потенциал">
                  <div className={styles.formColumn}>
                      <div className={styles.formGrid3}>
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
          <div className={styles.sidebarColumn}>
              
              {/* ЭКОЛОГИЯ */}
              <Section title="🌿 Окружение (1-5)">
                  <div className={styles.formGrid2}>
                      <div>
                          <Label>Воздух</Label>
                          <Input type="number" value={formData.eco_score.air} onChange={v => updateNested('eco_score', 'air', v)} />
                      </div>
                      <div>
                          <Label>Тишина</Label>
                          <Input type="number" value={formData.eco_score.noise} onChange={v => updateNested('eco_score', 'noise', v)} />
                      </div>
                  </div>
                  <div className={styles.formDivider}>
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
                  <div className={styles.formStackSmall}>
                      <div>
                          <Label>Имя агента</Label>
                          <Input value={formData.agent_profile.name} onChange={v => updateNested('agent_profile', 'name', v)} />
                      </div>
                      <div>
                          <TextareaWithCounter 
                              value={formData.owner_quote}
                              onChange={v => setFormData({...formData, owner_quote: v})}
                              placeholder="Продаю в связи с переездом..."
                              label="Цитата собственника"
                              maxLength={500}
                              helper="Личный комментарий от собственника"
                              minHeight="100px"
                          />
                      </div>
                  </div>
              </Section>

              {/* ПУБЛИКАЦИЯ */}
              <Section title="🚀 Публикация">
                  <div className={styles.formStackSmall}>
                      <div className={styles.formRow}>
                          <div>
                              <div className={styles.formLabelBold}>Статус публикации</div>
                              <div className={styles.formLabelSub}>
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
                              className={styles.previewLink}
                          >
                              👁️ Предпросмотр на сайте
                          </a>
                      )}
                  </div>
              </Section>

              <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className={`${styles.btnPrimary} ${styles.btnFull} ${status === 'loading' ? styles.btnDisabled : ''}`}
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
    <div className={styles.adminMainContent}>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-white">Объекты недвижимости</h1>
          <p className="text-slate-500">Всего объектов: {properties.length}</p>
        </div>
        <button 
          onClick={handleNewProperty}
          className={styles.btnPrimary}
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
          className={styles.adminSearchInput}
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
            className={`${styles.btnPrimary} ${styles.btnMarginTop}`}
          >
            Создать первый объект
          </button>
        </div>
      ) : (
        <div className={styles.adminTableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.adminTableHeader}>
                <th className={styles.adminTableHeaderCell}>Фото</th>
                <th className={styles.adminTableHeaderCell}>Название</th>
                <th className={styles.adminTableHeaderCell}>Адрес</th>
                <th className={styles.adminTableHeaderCell}>Цена</th>
                <th className={styles.adminTableHeaderCell}>Площадь</th>
                <th className={`${styles.adminTableHeaderCell} text-center`}>Статус</th>
                <th className={`${styles.adminTableHeaderCell} text-center`}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr 
                  key={property.id} 
                  className={styles.adminTableRow}
                >
                  <td className={styles.adminTableCell}>
                    <div className={styles.adminTableImage}>
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt="" 
                        />
                      ) : (
                        <span className="text-2xl">🏠</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.adminTableCell}>
                    <div className={styles.adminTableTitle}>{property.title}</div>
                    {property.complex_name && (
                      <div className={styles.adminTableSubtitle}>{property.complex_name}</div>
                    )}
                  </td>
                  <td className={styles.adminTableCell}>{property.address}</td>
                  <td className={styles.adminTableCell}>
                    <span className={styles.adminTablePrice}>{formatPrice(property.price)}</span>
                  </td>
                  <td className={styles.adminTableCell}>{property.area_sqm} м²</td>
                  <td className={`${styles.adminTableCell} text-center`}>
                    <span className={`${styles.adminTableStatus} ${
                      property.is_active ? styles.adminTableStatusActive : styles.adminTableStatusInactive
                    }`}>
                      {property.is_active ? '● Активен' : '○ Скрыт'}
                    </span>
                  </td>
                  <td className={styles.adminTableCell}>
                    <div className={styles.adminTableActions}>
                      <button
                        onClick={() => loadPropertyForEdit(property.id)}
                        className={`${styles.adminTableActionBtn} ${styles.adminTableActionEdit}`}
                      >
                        ✏️ Ред.
                      </button>
                      <button
                        onClick={() => deleteProperty(property.id)}
                        aria-label="Удалить"
                        className={`${styles.adminTableActionBtn} ${styles.adminTableActionDelete}`}
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
        <div className={styles.pagination}>
          <button
            onClick={() => fetchProperties(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationBtn}
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => fetchProperties(page)}
              className={`${styles.paginationBtn} ${page === currentPage ? styles.paginationBtnActive : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => fetchProperties(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationBtn}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

// UI HELPER COMPONENTS
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
        <div className={styles.textareaWrapper}>
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

