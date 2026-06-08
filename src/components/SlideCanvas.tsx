import { CSSProperties, forwardRef, ReactNode } from "react";
import { BrandKit, ListStyle, Slide } from "../types";
import { templateKind } from "../data/templates";

export const CANVAS_W = 1080;
export const CANVAS_H = 1350;

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseRich(text: string, accent: string): ReactNode {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|==[^=]+==)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={key++} style={{ fontWeight: 700, fontStyle: "italic" }}>
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("==")) {
      out.push(
        <span key={key++} style={{ color: accent }}>
          {tok.slice(2, -2)}
        </span>
      );
    } else {
      out.push(
        <em key={key++} style={{ fontStyle: "italic" }}>
          {tok.slice(1, -1)}
        </em>
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function rich(text: string, highlight: string, accent: string): ReactNode {
  let t = text;
  if (highlight && text.includes(highlight)) {
    t = text.replace(highlight, `==${highlight}==`);
  }
  return parseRich(t, accent);
}

function Brace({ color }: { color: string }) {
  return (
    <svg width="26" height="58" viewBox="0 0 26 58" fill="none" style={{ flex: "none", marginTop: 4 }}>
      <path
        d="M21 3 C9 5 12 13 12 17 L12 41 C12 45 9 53 21 55"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Marker({ style, accent, index, brand }: { style: ListStyle; accent: string; index: number; brand: BrandKit }) {
  if (style === "brace") return <Brace color={accent} />;
  if (style === "arrow") return <span style={{ color: accent, fontSize: 36, lineHeight: 1.3, flex: "none" }}>→</span>;
  if (style === "dash") return <span style={{ color: accent, fontSize: 36, lineHeight: 1.3, flex: "none" }}>—</span>;
  if (style === "number")
    return (
      <span style={{ color: accent, fontFamily: brand.fonts.title, fontSize: 34, lineHeight: 1.2, flex: "none" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    );
  return null;
}

function HandConnector({ color }: { color: string }) {
  return (
    <svg width="74" height="96" viewBox="0 0 74 96" fill="none" style={{ flex: "none" }}>
      <path d="M54 6 C22 12 14 44 18 66 C20 78 26 84 33 88" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M33 88 L21 80 M33 88 L44 76" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  slide: Slide;
  brand: BrandKit;
}

export const SlideCanvas = forwardRef<HTMLDivElement, Props>(function SlideCanvas({ slide, brand }, ref) {
  const t = slide.templateId;
  const kind = templateKind(t);
  const accent = slide.accent || brand.palette.orange;
  const img = slide.image;
  const hasImg = !!img?.src;

  const baseBg =
    t === "t2"
      ? brand.palette.terracotta
      : t === "t6"
      ? brand.palette.cream
      : t === "t8"
      ? brand.palette.brown
      : brand.palette.blackSoft;

  const onLight = kind === "cream" && !hasImg;
  const textColor = onLight ? brand.palette.brown : brand.palette.cream;
  const subColor = onLight ? hexA(brand.palette.brown, 0.82) : hexA(brand.palette.cream, 0.88);

  const titleStyle: CSSProperties = {
    fontFamily: brand.fonts.title,
    fontSize: slide.titleSize,
    lineHeight: 1.04,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.01em",
    textAlign: slide.align,
    whiteSpace: "pre-line",
  };
  const subStyle: CSSProperties = {
    fontFamily: brand.fonts.body,
    fontSize: 36,
    lineHeight: 1.45,
    color: subColor,
    margin: 0,
    textAlign: slide.align,
    whiteSpace: "pre-line",
  };

  const lines = slide.secondary.split("\n").map((l) => l.trim()).filter(Boolean);

  const List = ({ style, fontSize = 36 }: { style: ListStyle; fontSize?: number }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Marker style={style} accent={accent} index={i} brand={brand} />
          <div style={{ fontFamily: brand.fonts.body, fontSize, lineHeight: 1.34, color: subColor }}>
            {parseRich(ln, accent)}
          </div>
        </div>
      ))}
    </div>
  );

  const Title = ({ extra }: { extra?: CSSProperties }) => (
    <h1 style={{ ...titleStyle, ...extra }}>{rich(slide.title, slide.highlight, accent)}</h1>
  );

  const Sub = () => {
    if (!slide.secondary) return null;
    if (slide.listStyle !== "none") return <List style={slide.listStyle} />;
    return <p style={subStyle}>{parseRich(slide.secondary, accent)}</p>;
  };

  const Footer = ({ color, align = "left" }: { color: string; align?: CSSProperties["textAlign"] }) => (
    <div
      style={{
        fontFamily: brand.fonts.body,
        fontSize: 26,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        opacity: 0.85,
        textAlign: align,
        flex: "none",
        marginTop: "auto",
        paddingTop: 24,
      }}
    >
      {brand.brand} · {brand.site}
    </div>
  );

  const showHandNote = !!(slide.handNote && t !== "t7" && t !== "t8");
  const bottomReserve = (showHandNote ? 130 : 0) + (slide.showSignature ? 48 : 0);

  function layout(): ReactNode {
    switch (t) {
      case "t2":
        return (
          <>
            <Title />
            <Sub />
            <Footer color={brand.palette.cream} />
          </>
        );

      case "t3":
        return (
          <>
            <Title />
            <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: "auto" }}>
              {slide.secondary &&
                (slide.listStyle !== "none" ? (
                  <List style={slide.listStyle} />
                ) : (
                  <div style={{ background: accent, color: brand.palette.brown, padding: "30px 34px", borderRadius: 16, maxWidth: 760 }}>
                    <p style={{ ...subStyle, color: brand.palette.brown, fontWeight: 500, textAlign: "left" }}>
                      {parseRich(slide.secondary, brand.palette.brown)}
                    </p>
                  </div>
                ))}
              <Footer color={brand.palette.cream} />
            </div>
          </>
        );

      case "t4": {
        const style: ListStyle = slide.listStyle !== "none" ? slide.listStyle : "number";
        return (
          <div style={{ display: "flex", gap: 40, width: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <List style={style} fontSize={34} />
            </div>
            <div style={{ width: 360, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <Title extra={{ textAlign: "right" }} />
              <Footer color={textColor} align="right" />
            </div>
          </div>
        );
      }

      case "t5":
        return (
          <>
            <Title extra={{ fontStyle: "italic", maxWidth: 840 }} />
            <Footer color={brand.palette.cream} />
          </>
        );

      case "t6":
        return (
          <>
            <div style={{ width: 90, height: 4, background: accent, flex: "none" }} />
            <Title />
            <Sub />
            <Footer color={onLight ? brand.palette.terracotta : brand.palette.cream} />
          </>
        );

      case "t7":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28, width: "100%" }}>
            <div style={{ fontFamily: brand.fonts.title, fontSize: 180, lineHeight: 0.9, color: accent, flexShrink: 0 }}>“</div>
            <Title extra={{ fontStyle: "italic", textAlign: "center", maxWidth: 840, flexShrink: 0 }} />
            {slide.secondary && (
              <p style={{ ...subStyle, textAlign: "center", flexShrink: 0, marginTop: 4 }}>{parseRich(slide.secondary, accent)}</p>
            )}
            <div
              style={{
                fontFamily: brand.fonts.body,
                fontSize: 28,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: subColor,
                flexShrink: 0,
                marginTop: 12,
              }}
            >
              — {brand.brand}
            </div>
          </div>
        );

      case "t8":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 36, width: "100%" }}>
            <Title extra={{ textAlign: "center", maxWidth: 820 }} />
            {slide.secondary && (
              <div style={{ background: accent, color: brand.palette.brown, padding: "26px 46px", borderRadius: 999, fontFamily: brand.fonts.body, fontSize: 36, fontWeight: 600 }}>
                {slide.secondary}
              </div>
            )}
            <Footer color={brand.palette.cream} align="center" />
          </div>
        );

      case "t9": {
        const style: ListStyle = slide.listStyle !== "none" ? slide.listStyle : "brace";
        return (
          <>
            <Title extra={{ fontSize: Math.max(slide.titleSize, 96) }} />
            <List style={style} />
          </>
        );
      }

      case "t1":
      default:
        return (
          <>
            <Title extra={{ maxWidth: 880 }} />
            <Sub />
            <Footer color={brand.palette.cream} />
          </>
        );
    }
  }

  return (
    <div
      ref={ref}
      data-export-bg={baseBg}
      style={{
        position: "relative",
        width: CANVAS_W,
        height: CANVAS_H,
        overflow: "hidden",
        background: baseBg,
        color: textColor,
        fontFamily: brand.fonts.body,
        boxSizing: "border-box",
      }}
    >
      {hasImg && (
        <img
          src={img!.src}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${img!.posX}% ${img!.posY}%`,
            transform: `scale(${img!.zoom})`,
            transformOrigin: "center",
            filter: `saturate(${img!.saturate}%) contrast(${img!.contrast}%) blur(${img!.blur}px)`,
          }}
        />
      )}

      {hasImg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${hexA(brand.palette.orange, 0.35)}, ${hexA(brand.palette.brown, 0.5)})`,
            opacity: (img!.warm || 0) / 100,
          }}
        />
      )}

      <div style={{ position: "absolute", inset: 0, background: brand.palette.blackSoft, opacity: slide.darken / 100 }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: NOISE,
          backgroundSize: "200px 200px",
          opacity: (slide.grain / 100) * 0.55,
          pointerEvents: "none",
        }}
      />

      {slide.showHandle && (
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: brand.fonts.body,
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: onLight ? hexA(brand.palette.brown, 0.75) : hexA(brand.palette.cream, 0.78),
            zIndex: 3,
          }}
        >
          {brand.instagram}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: `90px 90px ${90 + bottomReserve}px`,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, width: "100%" }}>
          {layout()}
        </div>
      </div>

      {showHandNote && (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            bottom: slide.showSignature ? 110 : 72,
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            zIndex: 3,
          }}
        >
          <HandConnector color={accent} />
          <div style={{ fontFamily: brand.fonts.hand, fontSize: 48, lineHeight: 1.06, color: accent }}>
            {parseRich(slide.handNote, accent)}
          </div>
        </div>
      )}

      {slide.showSignature && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: brand.fonts.body,
              fontSize: 24,
              padding: "8px 22px",
              borderRadius: 999,
              background: hexA(brand.palette.blackSoft, 0.45),
              color: hexA(brand.palette.cream, 0.92),
              border: `1px solid ${hexA(brand.palette.cream, 0.25)}`,
            }}
          >
            {brand.instagram}
          </div>
        </div>
      )}
    </div>
  );
});
