# Medgical Patients — Requisitos

> *Your Medical Data. Your Control.*
> Versão 0.1 · 6 de outubro de 2026 · Documento de trabalho, a refinar com a Medgical nas primeiras semanas do projeto.

## 1. Visão

Cada pessoa deve ter na Medgical Patients **todo o seu historial clínico num só sítio**: exames, relatórios, receitas, diagnósticos, vacinas e dados de saúde do dia a dia. Pode **receber** a informação de qualquer origem, **organizá-la** e **mostrá-la ou partilhá-la** com o médico seguinte, de forma segura e sob o seu controlo.

A app tem de ser útil desde o primeiro dia, mesmo sem integrações: guardar um PDF ou uma fotografia de um exame já resolve um problema real. As integrações (hospitais, standards europeus, wearables) acrescentam valor por cima desta base.

## 2. Âmbito

### 2.1 Origens de informação

| Origem | Exemplos | Como entra na app |
| --- | --- | --- |
| Ficheiros do próprio utilizador | PDFs de análises, relatórios, receitas, faturas de consultas | Partilhar a partir de outra app, seletor de ficheiros, email |
| Fotografias / papel | Relatório impresso, receita em papel, caixa de medicamento | Câmara com digitalização de documento + OCR |
| Armazenamento na cloud | Google Drive, iCloud Drive, Dropbox, OneDrive | Seletor de ficheiros do sistema; opcionalmente ligação direta a uma pasta |
| Apps de hospitais e clínicas | SNS 24 / Registo de Saúde Eletrónico, apps de grupos privados, portais de laboratórios | Exportação ou partilha de PDF; no futuro, APIs e standards (FHIR, IPS) |
| Plataforma Medgical | Resumo de consulta validado pelo médico, medicação, exames pedidos, próximos passos | Integração direta e automática |
| Apps de saúde do telemóvel | Apple Health (HealthKit), Android Health Connect | Leitura autorizada pelo utilizador, sincronização periódica |
| Relógios e wearables | Apple Watch, Wear OS, Garmin, Fitbit, Samsung, Withings | Através do Apple Health / Health Connect (sem integrações individuais por marca numa primeira fase) |
| Imagiologia | Raio-X, TAC, ressonância (DICOM), muitas vezes em CD ou link | Relatório em PDF numa primeira fase; imagens DICOM numa fase posterior |

### 2.2 Fora de âmbito (para já)

- Visualizador DICOM completo e armazenamento de estudos de imagem pesados.
- Integrações proprietárias com cada hospital, enquanto não houver acordos e APIs disponíveis.

## 3. Atores

| Ator | Descrição |
| --- | --- |
| **Paciente** | Dono dos dados. Cria a conta, importa, organiza e partilha. |
| **Cuidador** | Gere o perfil de outra pessoa (filho menor, pai idoso) com autorização. |
| **Profissional de saúde** | Recebe acesso temporário à informação que o paciente escolheu partilhar. Não precisa de conta. |
| **Plataforma Medgical** | Sistema externo que envia informação validada após uma consulta. |
| **Sistemas de saúde externos** | Hospitais, laboratórios e serviços nacionais/europeus que fornecem dados em formatos interoperáveis. |

## 4. Requisitos funcionais

Prioridade (MoSCoW): **M** = Must, **S** = Should, **C** = Could, **W** = Won't (nesta versão).
Estado: ✅ implementado · 🟡 parcial · ⬜ por fazer.

### 4.1 Conta, perfil e acesso

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-01 | Registo com nome, email e palavra-passe. | M | ✅ |
| RF-02 | Login e logout, com a sessão guardada de forma segura no dispositivo. | M | ✅ |
| RF-03 | Recuperação de palavra-passe por email. | M | ⬜ |
| RF-04 | Desbloqueio da app com biometria (Face ID / impressão digital) ou PIN, configurável. | M | ⬜ |
| RF-05 | Autenticação de dois fatores. | S | ⬜ |
| RF-06 | Perfil clínico base: data de nascimento, sexo, grupo sanguíneo, contactos de emergência, número de utente. | M | ⬜ |
| RF-07 | Vários perfis por conta (ex.: filhos, pais), com indicação clara de qual perfil está ativo. | S | ⬜ |
| RF-08 | Gestão de sessões/dispositivos ativos, com opção de terminar sessões remotamente. | S | ⬜ |
| RF-09 | Eliminar a conta e todos os dados (direito ao apagamento). | M | ⬜ |
| RF-10 | Autenticação com Chave Móvel Digital, para ligar a serviços públicos. | C | ⬜ |

### 4.2 Importação de documentos

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-20 | Receber documentos através do menu *Partilhar* do sistema (iOS e Android), a partir de qualquer app: email, apps de hospitais, Drive, browser. | M | 🟡 só PDF, requer build própria |
| RF-21 | Adicionar documentos através do seletor de ficheiros do sistema, incluindo fornecedores de cloud (Google Drive, iCloud, Dropbox, OneDrive). | M | 🟡 só PDF |
| RF-22 | Suportar PDF, imagens (JPEG, PNG, HEIC) e documentos de texto comuns. | M | 🟡 só PDF |
| RF-23 | Digitalizar documentos em papel com a câmara (deteção de margens, correção de perspetiva, várias páginas num só documento). | M | ⬜ |
| RF-24 | Importar várias páginas ou vários ficheiros de uma só vez. | S | 🟡 |
| RF-25 | Se houver partilha sem sessão iniciada, guardar o documento pendente e importá-lo depois do login. | M | ✅ |
| RF-26 | Detetar documentos duplicados (mesmo ficheiro ou conteúdo) e avisar antes de importar. | S | ⬜ |
| RF-27 | Ligar uma pasta do Google Drive / iCloud e importar automaticamente os documentos novos. | C | ⬜ |
| RF-28 | Endereço de email pessoal da app (ex.: `nome@inbox.medgical.ai`) para reencaminhar resultados recebidos por email. | C | ⬜ |
| RF-29 | Importar ficheiros interoperáveis: FHIR (JSON/XML), International Patient Summary (IPS) e CDA. | S | ⬜ |
| RF-30 | Importar relatórios de imagiologia e guardar o link ou ficheiro DICOM associado. | C | ⬜ |

### 4.3 Extração e organização da informação

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-40 | Cada documento tem metadados: título, data clínica (não só a data de importação), tipo, instituição, profissional e especialidade. | M | 🟡 título e data de importação |
| RF-41 | Classificação por tipo: análises clínicas, imagiologia, relatório de consulta, nota de alta, cirurgia/procedimento, receita, vacinação, atestado, outro. | M | ⬜ |
| RF-42 | OCR de PDFs digitalizados e de imagens, para tornar o texto pesquisável. | M | ⬜ |
| RF-43 | Sugestão automática de metadados (data, instituição, tipo) a partir do conteúdo, sempre editável pelo utilizador. | S | ⬜ |
| RF-44 | Extração de dados estruturados dos documentos, marcados como "extraído automaticamente — por confirmar" até o utilizador validar: resultados de análises (parâmetro, valor, unidade, intervalo de referência), medicação, diagnósticos, alergias e procedimentos. | S | ⬜ |
| RF-45 | Registo manual de medicação, alergias, doenças crónicas, cirurgias, vacinas e antecedentes familiares. | M | ⬜ |
| RF-46 | Organização por pastas/etiquetas livres e por episódio (ex.: "Cirurgia ao joelho 2026"). | S | ⬜ |
| RF-47 | Ligar documentos a entradas estruturadas (ex.: a análise que originou um diagnóstico). | C | ⬜ |
| RF-48 | Normalizar códigos clínicos quando possível (LOINC para análises, SNOMED CT / ICD para diagnósticos, ATC para medicamentos). | S | ⬜ |
| RF-49 | Identificar informação repetida ou relacionada vinda de origens diferentes (ex.: a mesma análise no PDF do laboratório e no resumo do hospital) e propor fusão. | S | ⬜ |

### 4.4 Consulta: timeline, pesquisa e visualização

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-60 | Visualizar PDFs e imagens dentro da app, com zoom e navegação por páginas. | M | ✅ PDF |
| RF-61 | Lista de documentos com ordenação e filtros (tipo, data, instituição, etiqueta). | M | 🟡 lista por data |
| RF-62 | Timeline clínica cronológica que junta documentos, consultas, diagnósticos, medicação e eventos. | M | ⬜ |
| RF-63 | Pesquisa por texto em títulos, metadados e conteúdo (OCR). | M | ⬜ |
| RF-64 | Gráficos de evolução de parâmetros analíticos (ex.: colesterol, HbA1c) com intervalos de referência. | S | ⬜ |
| RF-65 | Resumo clínico de emergência (alergias, medicação, doenças crónicas, grupo sanguíneo, contactos), acessível rapidamente e opcionalmente no ecrã de bloqueio. | S | ⬜ |
| RF-66 | Editar, renomear, mover e apagar documentos e entradas. | M | 🟡 apagar |
| RF-67 | Pesquisa em linguagem natural sobre o historial (ex.: "quando foi a última vez que fiz análises à tiroide?"), com referência ao documento de origem. | C | ⬜ |
| RF-68 | Explicações em linguagem simples de termos e resultados, com aviso de que não substituem o médico. | C | ⬜ |

### 4.5 Dados de saúde do telemóvel e wearables

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-80 | Ligar ao Apple Health (iOS) e ao Health Connect (Android) com consentimento explícito e granular por tipo de dado. | S | ⬜ |
| RF-81 | Importar métricas relevantes: frequência cardíaca (incl. em repouso), tensão arterial, glicemia, peso/IMC, SpO₂, temperatura, sono, passos/atividade, ECG e alertas de ritmo irregular quando disponíveis. | S | ⬜ |
| RF-82 | Sincronização em segundo plano, com indicação da última sincronização e da origem de cada valor (dispositivo/app). | S | ⬜ |
| RF-83 | Agregar e resumir as séries temporais (médias diárias/semanais, valores fora do normal) em vez de guardar todas as amostras em bruto. | S | ⬜ |
| RF-84 | Mostrar métricas na timeline e em gráficos, ao lado de análises e consultas. | S | ⬜ |
| RF-85 | Ler registos clínicos expostos pelas plataformas (HealthKit Clinical Records, registos médicos FHIR do Health Connect) quando estiverem disponíveis na região do utilizador. | C | ⬜ |
| RF-86 | Desligar uma origem e, opcionalmente, apagar os dados importados dela. | S | ⬜ |

### 4.6 Integração com a plataforma Medgical

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-100 | Associar a conta Medgical Patients ao paciente na plataforma Medgical (QR code na consulta, código ou email verificado). | M | ⬜ |
| RF-101 | Receber automaticamente, após a consulta, a informação validada pelo médico: resumo, alterações de medicação, exames pedidos e próximos passos. | M | ⬜ |
| RF-102 | Notificação push quando chega informação nova. | S | ⬜ |
| RF-103 | Informação vinda da Medgical identificada como "validada por profissional", distinta da introduzida pelo utilizador. | M | ⬜ |
| RF-104 | A app funciona plenamente sem a integração (médicos que não usam a Medgical). | M | ✅ |

### 4.7 Partilha e controlo de acesso

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-120 | Escolher exatamente o que partilhar: documentos específicos, categorias, intervalo de datas ou resumo. | M | ⬜ |
| RF-121 | Partilha por QR code ou link temporário, com validade configurável (ex.: 1 h, 24 h, 7 dias) e PIN opcional. | M | ⬜ |
| RF-122 | O profissional abre a partilha num browser, sem instalar nada nem criar conta. | M | ⬜ |
| RF-123 | Revogar uma partilha a qualquer momento, com efeito imediato. | M | ⬜ |
| RF-124 | Registo de acessos: quem abriu, quando e o quê, visível ao paciente. | M | ⬜ |
| RF-125 | Exportar o historial (ou uma seleção) em PDF de resumo e em formatos interoperáveis (FHIR / IPS). | S | ⬜ |
| RF-126 | Resumo automático para uma nova consulta, gerado a partir do historial e revisto pelo paciente antes de partilhar. | C | ⬜ |
| RF-127 | Partilha permanente com um cuidador ou médico de família, com permissões (só leitura / leitura e escrita). | C | ⬜ |
| RF-128 | Exportar todos os dados da conta (portabilidade, RGPD art. 20). | M | ⬜ |

### 4.8 Sincronização e dispositivos

| ID | Requisito | Prior. | Estado |
| --- | --- | --- | --- |
| RF-140 | Documentos e dados sincronizados com o backend, para não se perderem ao mudar ou perder o telemóvel. | M | ⬜ (hoje só no dispositivo) |
| RF-141 | Acesso offline aos documentos e ao resumo de emergência já descarregados. | M | 🟡 tudo local |
| RF-142 | Resolver conflitos de edição entre dispositivos. | S | ⬜ |

## 5. Requisitos não funcionais

### 5.1 Segurança e privacidade

| ID | Requisito | Prior. |
| --- | --- | --- |
| RNF-01 | Dados de saúde são categoria especial (RGPD art. 9): base legal por consentimento explícito, registado e revogável. | M |
| RNF-02 | Comunicação sempre por TLS 1.2+; nada de HTTP em produção. | M |
| RNF-03 | Cifra em repouso no backend (base de dados e ficheiros) e no dispositivo (armazenamento da app; segredos em Keychain/Keystore). | M |
| RNF-04 | Avaliar cifra ponta a ponta dos documentos, com chaves derivadas do utilizador, para que nem o servidor os consiga ler. | S |
| RNF-05 | Tokens de sessão guardados apenas como digest no servidor, com expiração e revogação. | M |
| RNF-06 | Registo de auditoria imutável das operações sobre dados (criação, acesso, partilha, eliminação). | M |
| RNF-07 | Limite de tentativas de autenticação e proteção contra força bruta. | M |
| RNF-08 | Ecrã ofuscado no seletor de apps e bloqueio automático após inatividade. | S |
| RNF-09 | Minimização de dados: pedir só as permissões de saúde necessárias; nada de analytics com dados clínicos. | M |
| RNF-10 | Alojamento na UE e subcontratantes com acordo RGPD; avaliação de impacto (AIPD/DPIA) antes de produção. | M |
| RNF-11 | Funcionalidades de IA: dados clínicos só enviados a fornecedores com garantias contratuais de não treino e retenção mínima, com consentimento explícito. | M |
| RNF-12 | Testes de segurança (OWASP MASVS para mobile, OWASP ASVS para a API) antes de cada release. | S |

### 5.2 Interoperabilidade e standards

| ID | Requisito | Prior. |
| --- | --- | --- |
| RNF-20 | Modelo de dados interno mapeável para HL7 FHIR R4 (Patient, Observation, Condition, MedicationStatement, AllergyIntolerance, Procedure, Immunization, DocumentReference, DiagnosticReport). | M |
| RNF-21 | Suporte ao International Patient Summary (IPS) para importação e exportação. | S |
| RNF-22 | Alinhamento com o Espaço Europeu de Dados de Saúde (EHDS, Regulamento (UE) 2025/327) e com o formato europeu de troca de registos de saúde eletrónicos. | S |
| RNF-23 | Terminologias: LOINC, SNOMED CT, ICD-10/ICD-11, ATC, UCUM para unidades. | S |
| RNF-24 | Proveniência de cada dado: origem, data de importação, se foi validado por um profissional e se foi extraído automaticamente. | M |

### 5.3 Usabilidade e acessibilidade

| ID | Requisito | Prior. |
| --- | --- | --- |
| RNF-30 | Importar um documento em 3 toques ou menos a partir da partilha. | M |
| RNF-31 | Interface em português (PT-PT) e inglês; datas e unidades no formato local. | M |
| RNF-32 | Acessibilidade WCAG 2.1 AA: leitores de ecrã, texto dinâmico, contraste e áreas de toque adequadas. | S |
| RNF-33 | Linguagem simples, pensada também para utilizadores idosos. | S |
| RNF-34 | Modo escuro. | C |

### 5.4 Desempenho, fiabilidade e plataforma

| ID | Requisito | Prior. |
| --- | --- | --- |
| RNF-40 | Apps nativas iOS (16+) e Android (10+) a partir de uma base de código React Native / Expo. | M |
| RNF-41 | Abrir um PDF de 10 páginas em menos de 2 s num telemóvel de gama média; arranque da app em menos de 3 s. | S |
| RNF-42 | Suportar documentos até 50 MB e historiais com milhares de documentos sem degradação visível. | S |
| RNF-43 | Backups diários do backend, com restauro testado; RPO ≤ 24 h, RTO ≤ 4 h. | M |
| RNF-44 | Disponibilidade da API ≥ 99,5 %. | S |
| RNF-45 | CI/CD com testes automáticos (unitários, integração da API e E2E mobile) e builds EAS. | S |
| RNF-46 | Observabilidade (logs, métricas, erros) sem dados clínicos nos logs. | M |

## 6. Restrições e dependências técnicas

- **Expo Go vs build própria**: a partilha a partir de outras apps, o Apple Health e o Health Connect exigem módulos nativos, por isso só funcionam numa *development build* ou na app publicada. O Expo Go serve para desenvolver o resto da interface.
- **Apps de hospitais**: a maioria não tem APIs públicas. O caminho realista inicial é a exportação/partilha de PDF (RF-20). As integrações estruturadas dependem de acordos e da implementação do EHDS em cada país.
- **HealthKit Clinical Records** e os registos médicos do Health Connect têm disponibilidade limitada por país e instituição.
- **Wearables**: integrar através das plataformas do sistema (Apple Health / Health Connect) evita manter integrações com cada fabricante.
- **Stack**: React Native (Expo) na app, Ruby on Rails (API) + PostgreSQL no backend, armazenamento de objetos compatível com S3 para os ficheiros.

## 7. Roadmap proposto

| Fase | Objetivo | Requisitos principais |
| --- | --- | --- |
| **0 — Feito** | Base da app | RF-01, RF-02, RF-20 (PDF), RF-21 (PDF), RF-25, RF-60 |
| **1 — Cofre de documentos** | Guardar qualquer documento clínico com segurança e sem o perder | RF-03, RF-04, RF-06, RF-09, RF-22, RF-23, RF-40, RF-41, RF-42, RF-61, RF-63, RF-66, RF-140, RF-141, RNF-01 a RNF-07 |
| **2 — Historial estruturado** | Transformar documentos em informação útil | RF-43, RF-44, RF-45, RF-48, RF-49, RF-62, RF-64, RF-65, RNF-20, RNF-24 |
| **3 — Partilha** | Levar o historial ao médico | RF-120 a RF-125, RF-128, RNF-06 |
| **4 — Integrações** | Receber dados automaticamente | RF-80 a RF-86 (wearables), RF-100 a RF-103 (Medgical), RF-29 (FHIR/IPS) |
| **5 — IA** | Encontrar e compreender | RF-67, RF-68, RF-126, RNF-11 |

## 8. Questões em aberto

1. Os documentos devem ficar cifrados ponta a ponta (mais privacidade, mas sem pesquisa e IA no servidor) ou cifrados no servidor (permite OCR, pesquisa e IA)?
2. Que instituições ou laboratórios a Medgical consegue envolver para um piloto de integração estruturada?
3. Qual o formato e o mecanismo de envio da plataforma Medgical para a app (webhook, FHIR, API própria)?
4. Que modelo de IA e fornecedor usar para extração e pesquisa, e onde corre (UE, on-device)?
5. A app é classificada como dispositivo médico (MDR) se fizer interpretações automáticas? Definir o limite entre "organizar/explicar" e "aconselhar".
6. Política de retenção dos dados de wearables: quanto histórico guardar e com que granularidade?
