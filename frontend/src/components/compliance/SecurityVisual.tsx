export function SecurityVisual() {
  return (
    <div className="h-48 w-full rounded-xl overflow-hidden relative border border-outline-variant/20 shadow-sm">
      <div
        className="w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPxPVD9x1tPeZ5pXPvftvwzFYVM7ZV5ToGPLBWCNmbZEj8tgyTnz9lQ2ZZ7BHMcnlV450c2qCbx1V-UhBz_UNgcpoAJycv7QtlLIT-JB0XZ3D-qD5aoLaIgvvkhr9-3bFrFXZ3gh1JvwL_yVDZYOk_e8yDshoQscevxlal5rda1MOoF4HEt7sA_4ZNt1DUGK06pbMnjN-aAlaFzayD2EVaQLGyuP1R-0IRUiClZfsHsMtQsQr4kGIk')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
    </div>
  );
}
