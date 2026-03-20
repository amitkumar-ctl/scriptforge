import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotification, selectNotification } from '../store/slices/uiSlice';

export default function Notification() {
  const dispatch     = useDispatch();
  const notification = useSelector(selectNotification);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => dispatch(clearNotification()), 3500);
    return () => clearTimeout(t);
  }, [notification, dispatch]);

  if (!notification) return null;

  const isError = notification.type === 'error';

  return (
    <div className={`
      fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-lg border text-sm
      font-mono animate-fade-up shadow-xl
      ${isError
        ? 'bg-danger/10 border-danger/30 text-danger'
        : 'bg-accent/10 border-accent/30 text-accent'}
    `}>
      {isError ? '✕ ' : '✓ '}{notification.message}
    </div>
  );
}
