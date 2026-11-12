import { useLayoutEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '@wearables-ui-toolkit/mrbd';

type FullWidthButtonProps = Omit<ButtonProps, 'width'>;

// Кнопка Toolkit принимает только числовую ширину, поэтому измеряем контейнер.
export function FullWidthButton(props: FullWidthButtonProps) {
  const holder = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | undefined>();

  useLayoutEffect(() => {
    const node = holder.current;
    if (!node) return undefined;
    const measure = () => setWidth(Math.floor(node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holder} className="full-width-button">
      <Button {...props} width={width} />
    </div>
  );
}
