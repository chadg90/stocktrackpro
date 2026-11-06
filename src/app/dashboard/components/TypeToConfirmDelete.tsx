'use client';

import React, { useEffect, useState } from 'react';
import Modal from './Modal';

type TypeToConfirmDeleteProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Exact string the user must type (company name, promo code, article title, etc.). */
  confirmValue: string;
  /** What to call the value in the prompt, e.g. "company name" or "promo code". */
  confirmLabel: string;
  warning?: string;
  processing?: boolean;
};

export default function TypeToConfirmDelete({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmValue,
  confirmLabel,
  warning = 'This cannot be undone.',
  processing = false,
}: TypeToConfirmDeleteProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (isOpen) setTyped('');
  }, [isOpen, confirmValue]);

  const matches = typed.trim() === confirmValue.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-white/70">{warning}</p>
        <p className="text-sm text-white/80">
          Type <span className="font-semibold text-white">{confirmValue}</span> to confirm.
        </p>
        <div>
          <label className="block text-sm text-white/70 mb-1 capitalize">{confirmLabel}</label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            placeholder={confirmValue}
          />
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches || processing}
            onClick={() => void onConfirm()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {processing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
