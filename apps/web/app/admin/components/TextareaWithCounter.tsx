'use client';

import { useState } from 'react';
import styles from '../admin.module.css';

export interface TextareaWithCounterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
}

export default function TextareaWithCounter({
  value,
  onChange,
  placeholder,
  maxLength,
  minHeight = '120px',
  label,
  helper,
  error,
  required
}: TextareaWithCounterProps) {
  const charCount = value?.length || 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  const isOverLimit = maxLength && charCount > maxLength;
  
  const getCounterClassName = () => {
    if (isOverLimit) return `${styles.charCounter} ${styles.charCounterError}`;
    if (isNearLimit) return `${styles.charCounter} ${styles.charCounterWarning}`;
    return styles.charCounter;
  };
  
  return (
    <div className={styles.textareaWrapper}>
      {label && (
        <label className={`${styles.inputLabel} ${required ? styles.inputLabelRequired : ''}`}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${styles.formTextarea} ${error ? styles.formInputError : ''}`}
        style={{ '--textarea-min-height': minHeight } as React.CSSProperties}
        aria-label={label || placeholder}
      />
      <div className={styles.textareaFooter}>
        <div>
          {helper && !error && <div className={styles.helperText}>{helper}</div>}
          {error && <div className={`${styles.helperText} ${styles.helperTextError}`}>{error}</div>}
        </div>
        {maxLength && (
          <div className={getCounterClassName()}>
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
