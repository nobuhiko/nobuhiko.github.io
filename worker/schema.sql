-- 外のページ (EC-CUBE オーナーズストアの説明文など) に貼った画像が、何回取りに来られたか。
-- 残すのは 日付・画像のパス・どこから・回数 だけ。IP や端末の情報は残さない。
CREATE TABLE IF NOT EXISTS hits (
  day  TEXT NOT NULL,   -- 日本時間の YYYY-MM-DD
  path TEXT NOT NULL,   -- 例: /shisa/explain-thumb.jpg
  src  TEXT NOT NULL,   -- 参照元のホスト名。例: www.ec-cube.net
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path, src)
);
