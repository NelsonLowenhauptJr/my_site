# Deploy automatico (GitHub -> servidor)

Fluxo: voce faz `git push` no GitHub e o servidor atualiza sozinho com a ultima versao do site.

## Visao geral

```text
Seu PC  -->  git push  -->  GitHub  -->  GitHub Actions  -->  SSH no servidor  -->  deploy.sh  -->  docker compose up -d --build
```

## 1. Subir o projeto no GitHub

No seu computador:

```bash
git init
git add .
git commit -m "Site pessoal com deploy automatico"
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

> O arquivo `.env` nao vai para o GitHub. Cada ambiente mantem o proprio `.env`.

## 2. Preparar o servidor (uma vez)

Requisitos no servidor:

- Git
- Docker
- Docker Compose plugin

### Clonar o repositorio

```bash
sudo mkdir -p /opt/nelson-site
sudo chown "$USER":"$USER" /opt/nelson-site
git clone git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git /opt/nelson-site
cd /opt/nelson-site
cp .env.example .env
chmod +x scripts/deploy.sh
docker compose up -d --build
```

Ajuste a porta em `.env` se necessario:

```env
APP_PORT=8091
```

Teste manual do deploy:

```bash
cd /opt/nelson-site
./scripts/deploy.sh
```

## 3. Chave SSH so para deploy

No servidor:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy
```

Copie a chave **privada** inteira (incluindo `BEGIN` e `END`).

## 4. Secrets no GitHub

No repositorio: **Settings -> Secrets and variables -> Actions -> New repository secret**

| Secret | Exemplo | Descricao |
|--------|---------|-----------|
| `DEPLOY_HOST` | `192.168.2.111` ou dominio | IP/host do servidor |
| `DEPLOY_USER` | `nelson` | Usuario SSH |
| `DEPLOY_SSH_KEY` | conteudo de `github_deploy` | Chave privada |
| `DEPLOY_PORT` | `22` | Porta SSH |
| `DEPLOY_PATH` | `/opt/nelson-site` | Caminho do clone no servidor |

## 5. Usar no dia a dia

```bash
git add .
git commit -m "Atualiza secao de contato"
git push
```

O workflow `.github/workflows/deploy.yml` roda automaticamente e executa no servidor:

1. `git fetch` + `git reset --hard origin/main`
2. `docker compose up -d --build`

Acompanhe em **Actions** no GitHub.

## Troubleshooting

### Deploy falhou no SSH

- Confirme firewall/porta SSH aberta para o GitHub Actions (IPs dinamicos).
- Teste manualmente: `ssh -i ~/.ssh/github_deploy usuario@servidor`.

### Site nao mudou no browser

- Pode ser cache do navegador (Ctrl+F5).
- CSS/JS tem cache de 30 dias no nginx; alteracoes em HTML aparecem na hora.

### Branch diferente de `main`

Edite `branches` em `.github/workflows/deploy.yml` e a variavel `DEPLOY_BRANCH` no workflow.

## Alternativa: webhook no servidor

Se nao quiser expor SSH ao GitHub, use um webhook local (nginx + script) ou um **self-hosted runner** do GitHub no proprio servidor. Para site pessoal, SSH via Actions costuma ser o caminho mais simples.
