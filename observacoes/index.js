require('dotenv').config()
const express = require('express')
const axios = require('axios')
const {v4: uuidv4} = require('uuid')
const app = express()
app.use(express.json())

const observacoesPorLembreteId = {}

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes = observacoesPorLembreteId[observacao.lembreteId]
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id) //copia o status do observacoes p/ obsParaAtualizar
    obsParaAtualizar.status = observacao.status
    axios.post('http://localhost:10000/eventos', {
        tipo: 'ObservacaoAtualizada',
        dados: {
            id: observacao.id,
            texto: observacao.texto,
            lembreteId: observacao.lembreteId,
            status: observacao.status,
            sentimento: observacao.sentimento
        }
    })
    },
    ObservacaoAnalisada: (observacao) => {
        const observacoes = observacoesPorLembreteId[observacao.lembreteId]
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id) //copia o sentimento do observacoes p/ obsParaAtualizar
    obsParaAtualizar.sentimento = observacao.sentimento
    axios.post('http://localhost:10000/eventos', {
        tipo: 'ObservacaoAtualizada',
        dados: {
            id: observacao.id,
            texto: observacao.texto,
            lembreteId: observacao.lembreteId,
            status: observacao.status,
            sentimento: observacao.sentimento
        }
    })
    }
}

app.get('/lembretes/:id/observacoes',(req, res) => {
    res.send(observacoesPorLembreteId[req.params.id] || [])
})

app.post('/lembretes/:id/observacoes',async (req, res) => {
    //gerar um id de observação
    const idObs = uuidv4()
    //pegar o texto da observação
    const {texto} = req.body
    const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || []
    observacoesDoLembrete.push({id: idObs, texto, status: 'aguardando', sentimento: 'aguardando'})
    observacoesPorLembreteId[req.params.id] = observacoesDoLembrete
    await axios.post(
        'http://localhost:10000/eventos',
        {
            tipo: 'ObservacaoCriada',
            dados: {
                id: idObs,
                texto,
                lembreteId: req.params.id,
                status: 'aguardando',
                sentimento: 'aguardando'
            }
        })
    res.status(201).send(observacoesDoLembrete)
})

app.post('/eventos', (req, res) => {
    try{
    funcoes[req.body.tipo](req.body.dados)
    res.status(200).send({msg: 'ok'})
    }
    catch(e){}
    res.status(200).send({msg:'ok'})
})

const {MSS_OBSERVACOES_PORTA} = process.env
app.listen(MSS_OBSERVACOES_PORTA, () => {console.log(`Observacoes.Porta ${MSS_OBSERVACOES_PORTA}`)})