const state={filter:"すべて",query:"",onlyUnlearned:false,done:new Set(JSON.parse(localStorage.getItem("tokurei-fe-20240728-done")||"[]"))};
const fields=["すべて",...new Set(QUESTIONS.map(x=>x.field))];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const box=(text,cls="")=>`<div class="v-box ${cls}">${esc(text)}</div>`;
const arrow=(label="")=>`<div class="v-arrow"><i>→</i>${label?`<small>${esc(label)}</small>`:""}</div>`;
const flow=(parts,labels=[])=>`<div class="v-flow">${parts.map((x,i)=>`${i?arrow(labels[i-1]||""):""}${box(x,i===parts.length-1?"focus":"")}`).join("")}</div>`;
const stack=(layers)=>`<div class="v-stack">${layers.map((x,i)=>`<div style="--i:${i}">${esc(x)}</div>`).join("")}</div>`;
const cycle=(items)=>`<div class="v-cycle">${items.map((x,i)=>`<div><b>${i+1}</b><span>${esc(x)}</span></div>`).join("")}</div>`;
const formula=(top,bottom,steps=[])=>`<div class="v-formula rich-formula"><strong>${esc(top)}</strong>${steps.map(s=>`<em>${esc(s)}</em>`).join("")}<span>${esc(bottom)}</span></div>`;
const compare=(leftTitle,left,rightTitle,right)=>`<div class="v-compare"><section><h4>${esc(leftTitle)}</h4>${left.map(x=>`<p>${esc(x)}</p>`).join("")}</section><b>VS</b><section class="good"><h4>${esc(rightTitle)}</h4>${right.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>`;
const matrix=(headers,rows)=>`<div class="mini-table"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const cards=(items)=>`<div class="v-cardset">${items.map((x,i)=>`<section class="${i===items.length-1?"focus":""}"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></section>`).join("")}</div>`;
const layer=(items,focus)=>`<div class="v-layers">${items.map(x=>`<div class="${x===focus?"focus":""}">${esc(x)}</div>`).join("")}</div>`;
const grid=(items)=>`<div class="v-grid">${items.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`;
const termFor=q=>typeof TERMS!=="undefined"?TERMS.find(t=>t.q===q.n):null;
function detailedFrame(q,visual){
  const term=termFor(q);
  const steps=(q.reasoning||[]).slice(0,3);
  const chips=Array.isArray(q.diagram)?q.diagram.slice(0,4):[];
  return `<div class="v-detail">
    <div class="v-detail-main">${visual}</div>
    <aside class="v-detail-side">
      <div class="v-detail-title">
        <span>見る順</span>
        <strong>${esc(term?.term||q.title)}</strong>
      </div>
      <ol>${steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      <div class="v-detail-cue">
        <b>覚える軸</b>
        <p>${esc(term?.cue||q.caption||q.title)}</p>
      </div>
      <div class="v-detail-trap">
        <b>注意</b>
        <p>${esc(q.trap)}</p>
      </div>
      ${chips.length?`<div class="v-detail-chips">${chips.map(x=>`<i>${esc(x)}</i>`).join("")}</div>`:""}
    </aside>
  </div>`;
}

function autoDiagram(q){
  const parts=Array.isArray(q.diagram)&&q.diagram.length?q.diagram:[q.title,q.answerText];
  if(q.field==="基礎理論"||q.field==="会計")return formula(parts[0],parts.slice(1).join(" → "));
  if(q.field==="データベース"||q.field==="ネットワーク"||q.field==="開発技術")return flow(parts);
  if(q.field==="セキュリティ"||q.field==="ストラテジ"||q.field==="マネジメント")return cards(parts.map((x,i)=>[i+1,x]));
  return flow(parts);
}

function richVisual(q){
  switch(q.n){
    case 1:return compare("桁落ち",["近い値同士を引く","有効桁が一気に減る"],"情報落ち",["大きい数に小さい数を足す","小さい数の桁が丸めで消える"]);
    case 2:return `<div class="bell-curve"><svg viewBox="0 0 320 160" aria-hidden="true"><path d="M20 130 C80 130 95 35 160 35 C225 35 240 130 300 130"/><line x1="160" y1="28" x2="160" y2="142"/></svg><b>平均</b><span>左右対称・釣鐘形・連続分布</span></div>`;
    case 3:return layer(["入力層","隠れ層1","隠れ層2","隠れ層3","出力層"],"隠れ層3");
    case 4:return formula("2秒 × (1000/100)^3 ÷ 4","500秒",["未知数10倍","計算量1000倍","CPU速度4倍で4分の1"]);
    case 5:return stack(["push A","push B","push C → pop C","pop B","push D → pop D","pop A"]);
    case 6:return formula("nを半分にし続ける","比較回数は log2 n",["n","n/2","n/4","...","1"]);
    case 7:return compare("値呼出し",["値のコピーを渡す","呼出し元は変わりにくい"],"参照呼出し",["参照先を渡す","呼出し元に影響し得る"]);
    case 8:return formula("平均CPI=4×0.3+8×0.6+10×0.1","700MHz÷7=100MIPS",["平均CPI=7"]);
    case 9:return flow(["CPUが参照","キャッシュミス","主記憶からブロック転送","キャッシュへ格納"]);
    case 10:return formula("1024×768×24bit÷8","2,359,296byte ≒ 2.4Mbyte",["画素数","色深度","bit→byte"]);
    case 11:return compare("通常構成",["一部故障で停止しやすい"],"フォールトトレラント",["冗長化","故障しても機能継続"]);
    case 12:return formula("スループット","単位時間あたりの処理量",["件/秒","トランザクション/分"]);
    case 13:return layer(["仮想アドレス空間","ページ","ページフレーム","主記憶"],"ページ");
    case 14:return flow(["ソースコード","コンパイル","最適化","実行時間短縮"]);
    case 15:return compare("できる",["利用","改変","再配布"],"条件あり",["著作権は残る","ライセンスに従う"]);
    case 16:return flow(["A xor B","C xor D","さらにxor","NOT","偶数個の1で1"]);
    case 17:return cards([["形状","3Dモデル"],["画像","表面に貼る"],["効果","木目・布・金属の質感"]]);
    case 18:return flow(["業務データ","整理・統合","蓄積","分析・意思決定支援"]);
    case 19:return compare("元の表",["キー: 注文番号+商品番号","商品番号→商品名"],"分離後",["発注明細","商品表"]);
    case 20:return flow(["商品を1件見る","在庫に同じ商品番号?","NOT EXISTS","無い商品だけ出力"]);
    case 21:return flow(["Javaアプリ","JDBC API","DBMS","SQL実行"]);
    case 22:return matrix(["後続＼先行","共有","排他"],[["共有","○ 並行可","× 待ち"],["排他","× 待ち","× 待ち"]]);
    case 23:return formula("100Mbyte=800Mbit","800÷(10×0.75)=約107秒",["実効速度=7.5Mbit/s"]);
    case 24:return layer(["アプリケーション層","トランスポート層","インターネット層","リンク層","ハードウェア層"],"インターネット層");
    case 25:return formula("255.255.255.240 = /28","146は144〜159の範囲",["ブロックサイズ=256-240=16"]);
    case 26:return flow(["ブラウザ要求","Webサーバ","CGIで外部プログラム起動","結果を返す"]);
    case 27:return cycle(["偵察","武器化","配送","攻撃実行","感染・侵入","遠隔操作","目的達成"]);
    case 28:return flow(["データ鍵で暗号化","データ鍵をマスター鍵で暗号化","暗号文と暗号化鍵を保存"]);
    case 29:return compare("低リスク",["いつもの端末","いつもの場所"],"高リスク",["未知の端末","追加認証"]);
    case 30:return compare("ITガバナンス",["IT活用全体の統制"],"セキュリティガバナンス",["情報保護の統制","IT統制と重なる"]);
    case 31:return cards([["検知","不正通信を見つける"],["防御","通信を遮断する"],["位置","ネットワーク経路上"]]);
    case 32:return compare("暗号化",["内容を読めなくする"],"ステガノグラフィ",["存在を隠す","画像などへ埋め込む"]);
    case 33:return flow(["事前共有鍵","端末とAPで共有","暗号化通信","WPA2-PSK"]);
    case 34:return flow(["開始","処理","分岐・並行","終了"]);
    case 35:return flow(["クラス定義","new","インスタンス生成","属性・操作を持つ実体"]);
    case 36:return flow(["設計成果物","レビュー","欠陥を早期発見","手戻り削減"]);
    case 37:return compare("静的解析",["実行しない","ソースを読む"],"動的解析",["実行する","挙動を測る"]);
    case 38:return formula("2000×0.04=80件","80×20%×20%×200万円=640万円",["潜在不良","初年度発見","影響度大だけ"]);
    case 39:return compare("スクラムマスター",["理解促進","障害除去","チーム支援"],"プロダクトオーナー",["価値最大化","優先順位"]);
    case 40:return compare("外部動作",["変えない"],"内部構造",["読みやすくする","保守しやすくする"]);
    case 41:return matrix(["工程","人月","人数","期間"],[["基本設計","4","2","2か月"],["詳細設計","8","4","2か月"],["製造・単体","12","6","2か月"],["結合","12","2","6か月"],["総合","4","2","2か月"]]);
    case 42:return cards([["PV","計画価値"],["EV","出来高"],["AC","実コスト"],["CPI/SPI","費用・予定の効率"]]);
    case 43:return compare("コールドスタート",["初期状態から起動","IPL"],"ロールバック/フォワード",["ログやコピーで回復"]);
    case 44:return flow(["落雷サージ","SPDへ逃がす","過電圧を抑制","機器保護"]);
    case 45:return flow(["監査対象","情報セキュリティ管理基準","客観的に評価","監査報告"]);
    case 46:return compare("As-Is",["現在の姿"],"To-Be",["あるべき姿","移行計画の目標"]);
    case 47:return flow(["発電・蓄電","通信で計測","需要を制御","電力網を最適化"]);
    case 48:return flow(["利害関係者","ニーズ・要望","制約条件","要件定義"]);
    case 49:return flow(["買収・合併","技術・人材・顧客を取得","経営資源として活用"]);
    case 50:return stack(["導入期: 認知を高める","成長期: 売上急増・競争激化","成熟期: 伸び鈍化","衰退期: 売上減少"]);
    case 51:return grid(["財務","顧客: クレーム件数・満足度","内部プロセス","学習と成長"]);
    case 52:return `<div class="s-curve"><svg viewBox="0 0 320 160" aria-hidden="true"><path d="M25 130 C80 130 92 118 115 92 C145 55 185 35 295 30"/><path d="M180 132 C215 128 228 110 250 82 C270 55 292 42 310 38"/></svg><span>導入 → 成長 → 成熟 → 次の技術</span></div>`;
    case 53:return flow(["家電・設備","電力を計測","見える化","最適制御"]);
    case 54:return compare("技術的",["CAD/CAM/CAE"],"組織的",["設計と生産を並行","コンカレント"]);
    case 55:return flow(["発注者が条件を公開","ネットで広く募集","受注者が応募"]);
    case 56:return matrix(["軸","例","所属"],[["職能軸","開発・営業・製造","専門性"],["事業軸","製品・顧客・案件","目的遂行"],["マトリックス","両方","二重所属"]]);
    case 57:return formula("当初: S+E=最大在庫量","変更後はXから始まるので X−S 分を取消",["X>S","そのまま納品だと超過"]);
    case 58:return compare("ヒストグラム",["階級ごとの度数","分布を見る"],"パレート図",["降順の棒","累積比率を見る"]);
    case 59:return formula("販売数=-30×1000+90000=60000","(1000−400)×60000−1000000=35000000",["限界利益600円"]);
    case 60:return flow(["派遣元が雇用","派遣元と派遣先が契約","派遣先が指揮命令"]);
    default:return autoDiagram(q);
  }
}
window.renderRichVisual=q=>detailedFrame(q,richVisual(q));
