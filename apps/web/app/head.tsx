export default function Head() {
  // Cambia el v=... cuando quieras romper cache
  const v = "20260218-1";

  return (
    <>
      <link rel="icon" type="image/png" href={`/logo-oso.png?v=${v}`} />
      <link rel="shortcut icon" type="image/png" href={`/logo-oso.png?v=${v}`} />
      <link rel="apple-touch-icon" href={`/logo-oso.png?v=${v}`} />
      <meta name="theme-color" content="#000000" />
    </>
  );
}
