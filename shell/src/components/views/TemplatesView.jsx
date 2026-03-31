import React from 'react';
import { useDispatch } from 'react-redux';
import { setPlatform, setConfigField,clearResult } from '../../store/slices/scriptSlice';
import { setActiveView } from '../../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES, PLATFORMS, DURATIONS } from '../../utils/constants';

export default function TemplatesView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const applyTemplate = (tpl) => {
     dispatch(clearResult());
    dispatch(setPlatform(tpl.platform));
    dispatch(setConfigField({ key: 'topic', value: tpl.topic }));
    dispatch(setConfigField({ key: 'tone',  value: tpl.tone }));
    dispatch(setConfigField({ key: 'hook',  value: tpl.hook }));
    const durations = DURATIONS[tpl.platform] || DURATIONS.custom;
    dispatch(setConfigField({ key: 'duration', value: durations[1] || durations[0] }));
    dispatch(setActiveView('generator'));
    navigate('/app');
  };

  return (
    <div className="pb-12">
      <div className="px-8 pt-8 pb-6 animate-fade-up">
        <h1 className="font-syne font-extrabold text-2xl mb-1">Templates</h1>
        <p className="text-xs text-muted">Quick-start from proven viral formats</p>
      </div>

      <div className="px-8 grid grid-cols-2 gap-4">
        {TEMPLATES.map((tpl, i) => {
          const platform = PLATFORMS.find((p) => p.id === tpl.platform);
          return (
            <button
              key={i}
              onClick={() => applyTemplate(tpl)}
              className="text-left p-4 rounded-xl bg-surface border border-white/7 cursor-pointer
                         transition-all duration-200 hover:-translate-y-px group"
              style={{ '--tpl-color': tpl.color, '--tpl-rgb': platform?.rgb }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tpl.color;
                e.currentTarget.style.background = `rgba(${platform?.rgb}, 0.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = '';
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: tpl.color }} className="text-base">{tpl.icon}</span>
                <span className="font-syne font-bold text-sm">{tpl.title}</span>
              </div>
              <p className="text-xs text-muted mb-3 leading-relaxed">{tpl.topic}</p>
              <div className="flex gap-1.5">
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full border"
                  style={{
                    color: tpl.color,
                    background: `rgba(${platform?.rgb}, 0.1)`,
                    borderColor: `rgba(${platform?.rgb}, 0.25)`,
                  }}
                >
                  {tpl.tone}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface2 text-muted border border-white/7">
                  {tpl.hook}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
