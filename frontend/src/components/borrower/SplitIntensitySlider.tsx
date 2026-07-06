type SplitIntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function SplitIntensitySlider({ value, onChange }: SplitIntensitySliderProps) {
  return (
    <div className="glass-panel rounded-xl p-8 shadow-sm">
      <h3 className="font-subhead-caps text-subhead-caps text-primary mb-6">REPAYMENT INTENSITY</h3>
      <div className="space-y-6">
        <div className="flex justify-between text-label-sm font-label-sm text-outline">
          <span>CONSERVATIVE</span>
          <span>AGGRESSIVE</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary-fixed"
        />
        <p className="text-label-sm text-on-surface-variant leading-tight">
          Adjusting the split affects your daily cash flow. A higher split reduces total interest paid over the life of the loan.
        </p>
      </div>
    </div>
  );
}
