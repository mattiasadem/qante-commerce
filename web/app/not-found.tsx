import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid-wrap">
      <h1>Sayfa yok</h1>
      <p className="muted">
        <Link href="/">Mağazaya dön</Link>
      </p>
    </div>
  );
}
