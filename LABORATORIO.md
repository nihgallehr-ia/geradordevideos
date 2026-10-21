# ViraMix LAB — ambiente separado de testes

## Endereços

- **Oficial:** https://viramix-pro.nihgallehr-ia.workers.dev/ — Cloudflare Worker `viramix-pro`.
- **Laboratório:** https://viramix-lab.nihgallehr-ia.workers.dev/ — Cloudflare Worker `viramix-lab`.

A versão oficial **não é atualizada** quando alguém altera ou compila o LAB.

## Branches

- `main`: projeto ViraMix Studio original.
- `viramix-pro-build`: código-fonte do editor comercial e compilação existente.
- `viramix-lab`: cópia independente do editor para novas funcionalidades.

## Como testar mudanças

1. Alterar somente o código da branch `viramix-lab`.
2. O workflow `Compilar ViraMix LAB` roda automaticamente, executa testes e `npm run build`. Se funcionar, salva a compilação em `commercial-output/` na mesma branch.
3. Implantar os novos arquivos compilados **somente** no Worker `viramix-lab`, preservando as verificações de acesso, páginas e rotas existentes.
4. Testar no navegador com a conta de proprietária: login, upload, montagem, MP4, ZIP, celular e desktop.
5. Só depois de aprovação explícita, portar as mudanças para `viramix-pro-build` e implantá-las no Worker oficial `viramix-pro`.

**Importante:** o workflow do GitHub compila, mas **não publica automaticamente** no Cloudflare; a implantação é uma etapa separada.

## Isolamento e restrições

- O LAB exibe uma identificação visual fixa e tem seu próprio endereço e Worker.
- O editor LAB aceita exclusivamente uma conta ativa marcada `partner_code = 'proprietaria'`; acesso de clientes é recusado.
- A API de alterações de licença (`/api/admin/access`) está bloqueada no Worker LAB. O painel administrativo do LAB é somente leitura.
- Criação de novas contas é desativada visualmente no login do LAB, e recuperação de senha redireciona à versão oficial.
- **As duas versões usam atualmente o mesmo projeto Supabase** para autenticação e consulta de permissões. Assim, alterações diretas no Supabase (schema, Auth, RLS, dados, e-mails) NÃO estão isoladas e podem afetar a produção. Para testar mudanças de banco de dados ou automações de cobrança, criar um projeto/ambiente de banco separado primeiro, avaliando custos e migração.
- O código atual encontra-se em um repositório GitHub público. Antes de ampliar a comercialização, avaliar migração das branches comerciais para um repositório privado. O código já entregue ao navegador não pode ser considerado segredo mesmo em repositório privado.

## Regra de publicação

Nunca apontar o Worker `viramix-pro` para builds experimentais. Não habilitar implantação automática do LAB na produção.
