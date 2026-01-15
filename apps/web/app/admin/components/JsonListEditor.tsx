'use client';

import React, { useState } from 'react';

interface JsonListEditorProps {
    title: string;
    items: any[];
    fields: { key: string; label: string; type: 'text' | 'number' }[];
    onChange: (items: any[]) => void;
}

export default function JsonListEditor({ title, items, fields, onChange }: JsonListEditorProps) {
    const [newItem, setNewItem] = useState<any>({});

    const addItem = () => {
        if (Object.keys(newItem).length > 0) {
            onChange([...items, newItem]);
            setNewItem({});
        }
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600 }}>{title}</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px' }}>
                        <div style={{ flex: 1, display: 'flex', gap: '12px', fontSize: '13px' }}>
                            {fields.map(f => (
                                <span key={f.key}>
                                    <strong style={{ opacity: 0.6 }}>{f.label}:</strong> {item[f.key]}
                                </span>
                            ))}
                        </div>
                        <button 
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${fields.length}, 1fr) auto`, gap: '8px' }}>
                {fields.map(f => (
                    <input 
                        key={f.key}
                        type={f.type}
                        value={newItem[f.key] || ''}
                        onChange={(e) => setNewItem({ ...newItem, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                        placeholder={f.label}
                        style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                ))}
                <button 
                    type="button"
                    onClick={addItem}
                    style={{ padding: '10px 16px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                    +
                </button>
            </div>
        </div>
    );
}
