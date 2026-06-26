const state={filter:"すべて",query:"",onlyUnlearned:false,done:new Set(JSON.parse(localStorage.getItem("fe-done")||"[]"))};
const fields=["すべて",...new Set(QUESTIONS.map(x=>x.field))];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const box=(text,cls="")=>`<div class="v-box ${cls}">${esc(text)}</div>`;
const arrow=(label="")=>`<div class="v-arrow"><i>→</i>${label?`<small>${esc(label)}</small>`:""}</div>`;
const flow=(parts)=>`<div class="v-flow">${parts.map((x,i)=>`${i?arrow():""}${box(x,i===parts.length-1?"focus":"")}`).join("")}</div>`;
const stack=(layers)=>`<div class="v-stack">${layers.map((x,i)=>`<div style="--i:${i}">${esc(x)}</div>`).join("")}</div>`;
const cycle=(items)=>`<div class="v-cycle">${items.map((x,i)=>`<div><b>${i+1}</b><span>${esc(x)}</span></div>`).join("")}</div>`;
const formula=(top,bottom)=>`<div class="v-formula"><strong>${esc(top)}</strong><span>${esc(bottom)}</span></div>`;
const compare=(leftTitle,left,rightTitle,right)=>`<div class="v-compare"><section><h4>${esc(leftTitle)}</h4>${left.map(x=>`<p>${esc(x)}</p>`).join("")}</section><b>VS</b><section class="good"><h4>${esc(rightTitle)}</h4>${right.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>`;

function autoDiagram(q){
  const parts=Array.isArray(q.diagram)&&q.diagram.length?q.diagram:[q.title,q.answerText];
  if(q.field==="基礎理論"||q.field==="会計")return formula(parts[0],parts.slice(1).join(" → "));
  if(q.field==="データベース"||q.field==="ネットワーク")return flow(parts);
  if(q.field==="セキュリティ")return cycle(parts);
  if(q.field==="ストラテジ"||q.field==="マネジメント")return stack(parts);
  if(q.field==="開発技術"||q.field==="プログラミング")return flow(parts);
  if(q.field==="システム"||q.field==="コンピュータ")return flow(parts);
  return flow(parts);
}

function richVisual(q){
  switch(q.n){
    case 1:return compare("桁落ち",["近い値同士の減算","有効桁が減る"],"情報落ち",["大きい値と小さい値の加算","小さい値が丸めで消える"]);
    case 2:return `<div class="v-formula"><strong>正規分布</strong><span>平均を中心に左右対称</span><span>釣鐘形</span><span>連続確率分布</span></div>`;
    case 4:return formula("2秒 × (1000/100)^3 ÷ 4","= 2 × 1000 ÷ 4 = 500秒");
    case 5:return flow(["A,B,Cをpush","Cをpop","Bをpop","Dをpush","D,Aをpop"]);
    case 6:return formula("比較ごとに候補が1/2","n → n/2 → n/4 → ... → 1 なので log2 n");
    case 8:return formula("平均CPI = 4×0.3 + 8×0.6 + 10×0.1 = 7","700MHz ÷ 7 = 100MIPS");
    case 10:return formula("1024×768×24bit ÷ 8","= 2,359,296byte ≒ 2.4Mbyte");
    case 16:return flow(["A xor B","C xor D","2つをxor","NOT","偶数個の1で出力1"]);
    case 19:return compare("元の表",["注文番号+商品番号がキー","商品番号→商品名"],"第3正規形",["発注明細を残す","商品表を分離"]);
    case 20:return flow(["商品を1件見る","在庫に同じ商品番号があるか","NOT EXISTS","無い商品だけ出力"]);
    case 22:return compare("両立する",["共有×共有"],"待たされる",["共有×排他","排他×共有","排他×排他"]);
    case 23:return formula("100Mbyte = 800Mbit","800 ÷ (10×0.75) = 106.7秒");
    case 24:return stack(["アプリケーション層","トランスポート層","インターネット層 ← 装置Aが扱う","リンク層","ハードウェア層"]);
    case 25:return formula("255.255.255.240 = /28","ブロックサイズ16、146は144〜159に含まれる");
    case 28:return flow(["データを鍵Aで暗号化","鍵Aを鍵Bで暗号化","暗号文+暗号化済み鍵を保管"]);
    case 29:return compare("通常条件",["普段の端末","普段の場所"],"高リスク条件",["未知の端末","追加認証を要求"]);
    case 30:return compare("ITガバナンス",["IT活用全体"],"情報セキュリティガバナンス",["情報保護の統制","範囲は重複し得る"]);
    case 38:return formula("2000×0.04=80件","80×20%×20%×200万円=640万円");
    case 41:return formula("人月÷人数を工程ごとに計算","2+2+2+6+2=14か月");
    case 42:return flow(["PV","EV","AC","CPIでコスト","SPIでスケジュール"]);
    case 43:return compare("コールドスタート",["初期状態から起動","IPL"],"ロールバック/フォワード",["ログやコピーで回復"]);
    case 49:return flow(["他社を買収・合併","技術・人材・顧客を取得","事業拡大や再編に活用"]);
    case 50:return stack(["導入期: 認知を高める","成長期: 売上急増・競争激化","成熟期: 伸び鈍化","衰退期: 売上減少"]);
    case 51:return compare("顧客の視点",["顧客満足","クレーム件数","継続関係"],"他の視点",["財務","内部プロセス","学習と成長"]);
    case 54:return compare("技術的アプローチ",["CAD/CAM/CAE"],"組織的アプローチ",["設計と生産を並行","コンカレントエンジニアリング"]);
    case 57:return formula("当初: S + E = 最大在庫量","変更後はXから始まるので X−S 分を取消");
    case 58:return compare("ヒストグラム",["階級ごとの度数","分布を見る"],"パレート図",["降順の棒","累積比率を見る"]);
    case 59:return formula("販売数=-30×1000+90000=60000","(1000−400)×60000−1000000=35000000");
    case 60:return flow(["派遣元が労働者を雇用","派遣元と派遣先が派遣契約","派遣先が指揮命令"]);
    default:return autoDiagram(q);
  }
}
window.renderRichVisual=richVisual;
