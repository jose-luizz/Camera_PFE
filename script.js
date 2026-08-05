async function iniciarCamera() {
    const video = document.querySelector('#video');

    try{
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        video.srcObject = stream;
    } catch(err){
        console.error("Erro ao acessar a câmera:", err);
        alert("Você precisa permitir o uso da câmera.");
    }
}

document.querySelector('#btn-foto').addEventListener('click', () => {

    const video = document.querySelector('#video');
    const canvas = document.querySelector('#canvas');
    const foto = document.querySelector('#foto-resultado');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR');
    const textoInfo = `Zé Luiz - ${dataFormatada} às ${horaFormatada}`;

    context.fillStyle = 'white';          
    context.strokeStyle = 'black';       
    context.lineWidth = 4;                
    context.font = '24px Arial';          
    context.textBaseline = 'bottom';     

    // 5. Define a posição do texto (canto inferior esquerdo com margem de 20px)
    const x = 20;
    const y = canvas.height - 20;

    // 6. Desenha a borda preta e depois o texto branco por cima
    context.strokeText(textoInfo, x, y);
    context.fillText(textoInfo, x, y);

    const data = canvas.toDataURL('image/png');
    foto.src = data;
    foto.style.display = 'block';
});

iniciarCamera();

// GRACINHA MINHA 

window.addEventListener('keydown', function(event) {

  if (event.key === ' ') {
    
    event.preventDefault(); 

    const botaoFoto = document.querySelector('#btn-foto');
    
    if (botaoFoto) {
      botaoFoto.click();
    }
  }
});


