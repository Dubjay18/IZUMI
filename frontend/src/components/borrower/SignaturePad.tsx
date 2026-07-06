import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";

export interface SignaturePadHandle {
  clear: () => void;
  signed: boolean;
}

export const SignaturePad = forwardRef<SignaturePadHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [signed, setSigned] = useState(false);
  const drawing = useRef(false);
  const points = useRef(0);

  useImperativeHandle(ref, () => ({
    clear: clearSignature,
    signed,
  }), [signed]);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getPos = (e: MouseEvent | Touch) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startPosition = useCallback((e: MouseEvent | Touch) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);
  }, []);

  const finishedPosition = useCallback(() => {
    drawing.current = false;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
  }, []);

  const draw = useCallback((e: MouseEvent | Touch) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#001512";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    points.current++;
    if (points.current > 5 && !signed) setSigned(true);
  }, [signed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => startPosition(e);
    const onMouseUp = () => finishedPosition();
    const onMouseMove = (e: MouseEvent) => draw(e);
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startPosition(e.touches[0]);
    };
    const onTouchEnd = () => finishedPosition();
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      draw(e.touches[0]);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchmove", onTouchMove);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [startPosition, finishedPosition, draw]);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.current = 0;
    setSigned(false);
  }

  return (
    <div className="relative group">
      <label className="font-label-sm text-label-sm text-outline mb-2 block">SIGNATURE BOX</label>
      <div
        ref={containerRef}
        className="w-full h-32 bg-white rounded border border-outline-variant relative flex items-center justify-center cursor-crosshair overflow-hidden"
      >
        <span
          className="text-outline-variant font-label-sm pointer-events-none italic absolute"
          style={{ opacity: signed ? 0 : 1 }}
        >
          Draw your signature here
        </span>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <button
        type="button"
        onClick={clearSignature}
        className="mt-2 text-label-sm text-error hover:underline flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
        Clear Signature
      </button>
    </div>
  );
});

SignaturePad.displayName = "SignaturePad";
