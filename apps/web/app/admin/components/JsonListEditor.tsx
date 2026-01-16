'use client';

import React, { useState } from 'react';
import styles from '../admin.module.css';

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
        <div className={styles.jsonListContainer}>
            <label className={styles.jsonListLabel}>{title}</label>
            
            <div className={styles.jsonListItems}>
                {items.map((item, index) => (
                    <div key={index} className={styles.jsonListItem}>
                        <div className={styles.jsonListItemContent}>
                            {fields.map(f => (
                                <span key={f.key} className={styles.jsonListItemField}>
                                    <strong className={styles.jsonListItemFieldLabel}>{f.label}:</strong> {item[f.key]}
                                </span>
                            ))}
                        </div>
                        <button 
                            type="button"
                            onClick={() => removeItem(index)}
                            className={styles.jsonListItemRemoveBtn}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className={styles.jsonListAddRow}>
                {fields.map(f => (
                    <input 
                        key={f.key}
                        type={f.type}
                        value={newItem[f.key] || ''}
                        onChange={(e) => setNewItem({ ...newItem, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                        placeholder={f.label}
                        className={styles.jsonListItemInput}
                        aria-label={f.label}
                    />
                ))}
                <button 
                    type="button"
                    onClick={addItem}
                    className={styles.jsonListAddBtn}
                >
                    +
                </button>
            </div>
        </div>
    );
}
