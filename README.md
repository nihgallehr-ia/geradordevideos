# ViraMix Studio 💜

Gerador de vídeos para TikTok Shop por combinação de clipes, sem custo por crédito.

## Funcionalidades
- Upload de múltiplos vídeos nas categorias Gancho, Desenvolvimento e Encerramento.
- Seleção de quantos clipes de desenvolvimento entram em cada vídeo.
- Mistura da ordem ou preservação da ordem de upload; combinações sem repetição no mesmo vídeo.
- Exportação em MP4 vertical, sem áudio, qualidade econômica ou HD.
- Download individual ou ZIP (até 30 vídeos por lote).
- Processamento local no navegador com FFmpeg WebAssembly; não faz geração de vídeo por inteligência artificial.

## Abrir o site
Para ativar o link **https://nihgallehr-ia.github.io/geradordevideos/**, entre nas configurações do repositório:
1. [Settings → Pages](https://github.com/nihgallehr-ia/geradordevideos/settings/pages).
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Volte a [Actions](https://github.com/nihgallehr-ia/geradordevideos/actions) e execute **Publicar ViraMix Studio** pelo botão **Run workflow** (ou faça um commit).

**Situação da instalação:** o projeto compila e os testes de combinação passam no GitHub Actions. A publicação do Pages precisa primeiro ser habilitada nas configurações, pois a integração de GitHub fornecida ao ChatGPT não possui autorização administrativa para habilitar Pages automaticamente.

## Observações
Recomendado usar computador e arquivos MP4 curtos no primeiro teste. A exportação depende da memória e CPU de seu dispositivo; vídeos grandes podem falhar. Som, fala, música e legendas não são preservados.
