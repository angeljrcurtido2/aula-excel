import { Fragment, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Texto corto con **negrita**, *cursiva* y [[código]] (sin párrafos). */
export function Inline({ t }: { t: string }) {
  const partes = t.split(/(\[\[.+?\]\]|\*\*.+?\*\*|\*[^*\s][^*]*?\*)/g);
  return (
    <>
      {partes.map((p, i): ReactNode => {
        if (p.startsWith('[[')) return <code key={i} className="tec">{p.slice(2, -2)}</code>;
        if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** Markdown con tablas; [[x]] se muestra como código. */
export function Md({ texto, className = '' }: { texto: string; className?: string }) {
  const t = texto.replace(/\[\[(.+?)\]\]/g, (_, c: string) => `\`${c}\``);
  return (
    <div className={`prosa ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{t}</ReactMarkdown>
    </div>
  );
}
