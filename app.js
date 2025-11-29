const pages=document.querySelectorAll('.page');
let i=0;
const prev=document.getElementById('prevBtn');
const next=document.getElementById('nextBtn');
const counter=document.getElementById('pageCounter');

function render(){
  pages.forEach((p,idx)=>{
    p.classList.remove('active','left','right');
    if(idx===i)p.classList.add('active');
    else if(idx<i)p.classList.add('left');
    else p.classList.add('right');
  });
  counter.textContent=(i+1)+' / '+pages.length;
}
prev.onclick=()=>{i=Math.max(0,i-1);render()}
next.onclick=()=>{i=Math.min(pages.length-1,i+1);render()}
render();

// Lightbox
const lb=document.getElementById('lightbox');
const lbImg=document.getElementById('lbImg');
const lbTitle=document.getElementById('lbTitle');
document.querySelectorAll('.dish-img').forEach(img=>{
  img.onclick=()=>{
    lbImg.src=img.src;
    lbTitle.textContent=img.closest('.page').dataset.title;
    lb.classList.remove('hidden');
  };
});
document.getElementById('closeLb').onclick=()=>lb.classList.add('hidden');
lb.onclick=e=>{if(e.target===lb)lb.classList.add('hidden');};
