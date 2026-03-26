export default function Footer() {
  return (
    <footer className="bg-knd-indigo border-t border-knd-purple/20 py-8">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="font-display text-knd-gold text-lg mb-2">こんにゃん堂</p>
        <p className="text-knd-lavender/60 text-xs">
          &copy; {new Date().getFullYear()} こんにゃん堂 All rights reserved.
        </p>
        <p className="text-knd-lavender/40 text-[10px] mt-2">
          ※占い結果はエンターテインメントです。重要な判断は専門家にご相談ください。
        </p>
      </div>
    </footer>
  );
}
