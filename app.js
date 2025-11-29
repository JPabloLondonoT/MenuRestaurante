
let dishes=JSON.parse(localStorage.getItem('dishes')||'[]');
let cart=JSON.parse(localStorage.getItem('cart')||'[]');

function save(){localStorage.setItem('dishes',JSON.stringify(dishes))}
function saveCart(){localStorage.setItem('cart',JSON.stringify(cart))}
function renderMenu(){
  const m=document.getElementById('menu'); m.innerHTML='';
  dishes.forEach((d,i)=>{
    const card=document.createElement('div');card.className='card';
    card.innerHTML=`<h3>${d.name}</h3><img src="${d.img}"/><p>${d.price}</p>
    <button onclick="addCart(${i})">Agregar</button>`;
    m.appendChild(card);
  });
}
function addCart(i){cart.push(dishes[i]);saveCart();updateCartCount()}
function updateCartCount(){document.getElementById('cartCount').textContent=cart.length}
function renderCart(){
  const c=document.getElementById('cartItems');c.innerHTML='';
  let total=0;
  cart.forEach(d=>{total+=parseFloat(d.price);const div=document.createElement('div');div.textContent=d.name+' - '+d.price;c.appendChild(div)});
  document.getElementById('cartTotal').textContent=total;
}
document.getElementById('cartBtn').onclick=()=>{renderCart();document.getElementById('cartDrawer').classList.remove('hidden')}
document.getElementById('closeCart').onclick=()=>document.getElementById('cartDrawer').classList.add('hidden')

document.getElementById('adminBtn').onclick=()=>{renderAdmin();document.getElementById('adminPanel').classList.remove('hidden')}
document.getElementById('closeAdmin').onclick=()=>document.getElementById('adminPanel').classList.add('hidden')

document.getElementById('dishForm').onsubmit=e=>{
 e.preventDefault();
 const fd=new FormData(e.target);
 let file=fd.get('imgFile');
 if(file && file.size>0){
   let r=new FileReader();
   r.onload=ev=>{
     dishes.push({name:fd.get('name'),price:fd.get('price'),cat:fd.get('cat'),img:ev.target.result});
     save();renderMenu();renderAdmin();
   };
   r.readAsDataURL(file);
 }else{
   dishes.push({name:fd.get('name'),price:fd.get('price'),cat:fd.get('cat'),img:''});
   save();renderMenu();renderAdmin();
 }
};

function renderAdmin(){
  const l=document.getElementById('dishList');l.innerHTML='';
  dishes.forEach((d,i)=>{
    let div=document.createElement('div');
    div.textContent=d.name+' - '+d.price;
    l.appendChild(div);
  });
}

renderMenu();updateCartCount();
