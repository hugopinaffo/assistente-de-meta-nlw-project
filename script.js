const form = document.getElementById ('form');
const apiKeyInput = document.getElementById('apiKey');
const gameSelectInput = document.getElementById('gameSelect');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');

const markdownToHtml = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml (text)
}

const askAI = async (question, gameSelect, apiKey) => {
  const model = "gemini-2.0-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  let pergunta = ``;

  if(gameSelect == "League of legends"){
    pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${gameSelect}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
   `
  } else if (gameSelect == "Valorant") {
    pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${gameSelect}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento das mecânicas, estratégia, agentes, mapas e boas práticas para evoluir na gameplay competitiva.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca mencione agentes, utilitários ou táticas que não existam no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Exemplo de pergunta do usuário: Melhor tática para entrada no mapa Corrode.

    ## Exemplo de resposta
    Agente: Waylay 
    Tática: use Lightspeed para avançar rápido e Refract (0,35s) para contornar ângulos, indo direto ao site. Sincronize Saturate expandida (12m) no choke — ótimo para cortar visão inimiga.
    Dica: combine avanço com smoke e flash de suporte, pois ela ainda é "coordenação-heavy". Se quiser pressões rápidas, priorize neutralizar ângulos com Refract, aproveitando animações mais suaves para reengajar.

    ---
    Aqui está a pergunta do usuário: ${question}
   `
  } else {
    pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${gameSelect}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento sobre armas, mapas, táticas, economia e treinos para melhorar a gameplay.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca cite armas ou mecânicas que não existam no meta atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Exemplo de pergunta do usuário: Melhora tática para defender B em Train com M4A4.

    ## Exemplo de resposta
    Arma: M4A4 (US$ 2.900)
    Posição: posicione-se atrás da caixa em Long A (box), com visão clara do choke.
    Util: use smoke no início para bloquear a visão T do Popdog e um flash alto por cima do telhado.
    Tática: prefira burst tap até três tiros, recuando para resetar spray. Com unique_call “Long A clear” você dá info e segura rotação.
    ---
    Aqui está a pergunta do usuário: ${question}
   `
  }

  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }
  ]

 // chamada API
 const response = await fetch(geminiURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents,
    tools
  })
 })

 const data = await response.json()
 return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const gameSelect = gameSelectInput.value
  const question = questionInput.value

  if(apiKey == '' || gameSelect == '' || question == '') {
    alert('Por favor, preencha todos os campos')
    return
  } 

  askButton.disabled = true;
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await askAI(question, gameSelect, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHtml (text)
    aiResponse.classList.remove('hidden')
  } catch(error) {
    console.log('Erro: ', error)
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove('loading');
  }
}

form.addEventListener('submit', sendForm);