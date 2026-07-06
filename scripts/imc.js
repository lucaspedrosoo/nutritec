function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const resultadoBox = document.getElementById('imc-resultado');
    const valorTxt = document.getElementById('imc-valor');
    const classTxt = document.getElementById('imc-classificacao');
    const sugestaoTxt = document.getElementById('imc-sugestao');

    if (!peso || !altura || peso <= 0 || altura <= 0) {
        alert('Por favor, insira valores válidos de peso e altura.');
        return;
    }

    const imc = peso / (altura * altura);
    resultadoBox.classList.remove('hidden');
    valorTxt.innerText = imc.toFixed(1);

    const bodyMetrics = {
        peso: peso,
        altura: altura,
        imc: Number(imc.toFixed(1)),
        classificacao: ''
    };

    if (imc < 18.5) {
        classTxt.innerText = 'Abaixo do Peso Recomendado';
        classTxt.style.color = '#d97706';
        sugestaoTxt.innerText = "Dica NutriTec: Filtre as receitas em 'Almoço & Jantar' para alimentos hipercalóricos e foque em treinos de 'Força & Músculos'.";
        bodyMetrics.classificacao = 'Abaixo do Peso Recomendado';
    } else if (imc >= 18.5 && imc < 25) {
        classTxt.innerText = 'Biotipo Ideal e Saudável';
        classTxt.style.color = '#16a34a';
        sugestaoTxt.innerText = 'Dica NutriTec: Parabéns! Explore livremente o catálogo, mesclando receitas leves com treinos de Força e Cardio.';
        bodyMetrics.classificacao = 'Biotipo Ideal e Saudável';
    } else if (imc >= 25 && imc < 30) {
        classTxt.innerText = 'Indicação de Sobrepeso';
        classTxt.style.color = '#ea580c';
        sugestaoTxt.innerText = "Dica NutriTec: Priorize a aba de receitas 'Detox & Shakes' e abuse do filtro 'Cardio & HIIT' para potencializar a queima.";
        bodyMetrics.classificacao = 'Indicação de Sobrepeso';
    } else {
        classTxt.innerText = 'Alerta de Obesidade';
        classTxt.style.color = '#dc2626';
        sugestaoTxt.innerText = "Dica NutriTec: Filtre as receitas em 'Detox' para controle de calorias e selecione treinos de 'Alongamento & Core' de baixo impacto.";
        bodyMetrics.classificacao = 'Alerta de Obesidade';
    }

    bodyMetrics.sugestao = sugestaoTxt.innerText;
    bodyMetrics.dataAtualizacao = new Date().toISOString();

    const userId = typeof window.getAuthUserId === 'function' ? window.getAuthUserId() : '';

    if (typeof window.saveBodyMetricsCache === 'function') {
        window.saveBodyMetricsCache(bodyMetrics, userId);
    } else {
        localStorage.setItem('nutritec-body-metrics', JSON.stringify(bodyMetrics));
    }
}

window.calcularIMC = calcularIMC;
