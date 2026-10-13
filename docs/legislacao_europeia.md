# Medgical Patients — Enquadramento e Legislação Europeia

> *Your Medical Data. Your Control.*  
> Versão 1.0 · Outubro de 2026 · Guia de conformidade regulatória e boas práticas de engenharia em saúde digital.

---

## 1. Visão Geral e Contexto Regulatório

A aplicação móvel e o backend do **Medgical Patients** tratam **dados de saúde**, considerados dados de categoria especial ao abrigo do direito europeu. Além disso, a aplicação disponibiliza mecanismos de partilha direta (QR Code / links temporários), exportação padronizada e funcionalidades de Inteligência Artificial (pesquisa semântica, resumos factuais e explicações de termos médicos).

Para garantir que o produto pode ser disponibilizado com segurança e legalidade no mercado da União Europeia, a arquitetura técnica, o desenvolvimento e os processos operacionais devem cumprir estritamente cinco grandes pilares legislativos comunitários (e diretivas complementares):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MEDGICAL PATIENTS (Mobile + Backend)                │
└───────┬──────────────────┬──────────────────┬──────────────────┬───────┘
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
   1. RGPD / GDPR        2. EHDS            3. MDR           4. AI Act
  (Reg. 2016/679)    (Reg. 2025/327)    (Reg. 2017/745)   (Reg. 2024/1689)
  Privacidade,       Interoperabilidade Limite estrito de Transparência,
  Consentimento,     FHIR R4 / IPS,     SaMD (não fazer   Pseudonimização,
  Portabilidade,     Partilha europeia  diagnóstico nem   Zero Retention
  Direito Apagamento                    prescrição)
        │
        └───────────────────────────────┬────────────────────────────────┘
                                        ▼
                         5. Cibersegurança & ePrivacy
                         (NIS 2, Cyber Resilience Act, ePrivacy)
                         Cifra em repouso/trânsito, Zero Trackers
```

---

## 2. Os Pilares Legislativos

### 2.1. RGPD — Regulamento Geral sobre a Proteção de Dados (Regulamento (UE) 2016/679)

O RGPD estabelece os princípios gerais de recolha, tratamento, segurança e direitos dos cidadãos quanto aos seus dados pessoais.

#### Artigo 9.º — Categorias Especiais de Dados (Dados Relativos à Saúde)
* **Regra geral:** O tratamento de dados de saúde é expressamente proibido, salvo se fundamentado numa das exceções legais previstas.
* **Base de Licitude no Medgical Patients:** **Consentimento explícito** do titular dos dados (Artigo 9.º, n.º 2, alínea a)).
* **Requisitos do consentimento:** Deve ser livre, específico, informado, inequívoco e revogável a qualquer momento com a mesma simplicidade com que foi concedido.

#### Princípios Estruturais de Tratamento (Artigo 5.º)
1. **Minimização de dados:** Recolher apenas os dados clínicos indispensáveis às finalidades apresentadas ao paciente.
2. **Limitação da conservação:** Manter dados apenas enquanto o utilizador tiver a conta ativa ou conforme os prazos de retenção expressamente consentidos.
3. **Integridade e confidencialidade:** Implementar medidas técnicas adequadas para impedir acessos não autorizados, perdas ou alterações ilícitas.

#### Direitos dos Titulares com Impacto Arquitetural Direto
* **Direito ao Apagamento / "Esquecimento" (Artigo 17.º — UC17 / RF09):**  
  * O utilizador pode eliminar a conta a qualquer momento.  
  * **Exigência técnica:** Eliminação em cascata imediata e verificada do utilizador, das credenciais/sessões, de todos os registos clínicos (`clinical_records`), ficheiros nos buckets S3/MinIO e das chaves de indexação vetorial.
* **Direito à Portabilidade (Artigo 20.º — UC16 / RF125, RF128):**  
  * O paciente tem o direito de receber os seus dados num formato estruturado, de uso corrente e de leitura automática.  
  * **Exigência técnica:** Exportação completa num pacote JSON interoperável (**HL7 FHIR R4 Bundle**) e opcionalmente em PDF clínico consolidado.
* **Direito de Acesso e Auditoria (Artigo 15.º — UC12 / RF14, RF124):**  
  * O titular tem o direito de saber com quem os seus dados foram partilhados e quem os consultou.  
  * **Exigência técnica:** Tabela de auditoria *append-only* (`audit_events`) que regista acessos do paciente e de médicos externos via links de partilha.

#### Transferências Internacionais (Capítulo V) e Soberania de Dados
* Todos os servidores primários, bases de dados (PostgreSQL), instâncias de armazenamento de ficheiros (S3 compatível) e modelos de linguagem **devem residir no Espaço Económico Europeu (EEE)**.
* Se forem utilizados subprocessadores (ex.: fornecedores de cloud ou APIs de IA), estes têm de assinar um Acordo de Tratamento de Dados (DPA) em conformidade com o RGPD (incluindo Cláusulas Contratuais-Tipo / SCCs se aplicável).

#### Avaliação de Impacto sobre a Proteção de Dados (AIPD / DPIA — Artigo 35.º)
* Sendo uma plataforma que processa dados de saúde em larga escala através de uma app móvel com partilha e IA, a realização de uma **AIPD** é obrigatória antes da entrada em produção.

---

### 2.2. EHDS — Espaço Europeu de Dados de Saúde (Regulamento (UE) 2025/327)

O EHDS foi desenhado para assegurar que os cidadãos da UE têm controlo pleno sobre os seus dados de saúde em qualquer estado-membro, facilitando o acesso primário e a interoperabilidade transfronteiriça.

#### Direitos do Cidadão no Uso Primário dos Dados
* Acesso imediato, gratuito e digital aos seus dados eletrónicos de saúde.
* Capacidade de transmitir e partilhar os seus dados clínicos com qualquer prestador de cuidados de saúde (público ou privado) sem fricção nem custos arbitrários.

#### Formato Europeu de Troca de Registos Eletrónicos de Saúde (EEHRxF)
O Medgical Patients deve alinhar a sua estrutura interna com as categorias prioritárias do EEHRxF:
* **Resumo do Paciente (*Patient Summary*):** Alinhado com o standard *International Patient Summary* (IPS).
* **Resultados e Relatórios Laboratoriais:** Análises clínicas com códigos LOINC e unidades UCUM.
* **Receitas e Despachos Eletrónicos:** Alinhados com terminologias padrão (código ATC / SNOMED CT).
* **Notas de Alta e Relatórios de Consulta:** Mapeáveis para recursos FHIR (`Encounter`, `Condition`, `Procedure`, `DocumentReference`).

#### Proveniência e Qualidade da Informação (RNF-24)
* O regulamento valoriza a rastreabilidade da origem: cada registo deve identificar claramente se foi emitido por uma instituição de saúde, se foi validado por um médico (ex.: plataforma Medgical) ou se foi introduzido manualmente pelo paciente.

---

### 2.3. MDR — Regulamento dos Dispositivos Médicos (Regulamento (UE) 2017/745)

O MDR define as regras para colocação no mercado de dispositivos médicos na UE, incluindo software médico (*SaMD — Software as a Medical Device*).

#### A Linha Vermelha da Regra 11 (Anexo VIII do MDR & MDCG 2019-11)
A Regra 11 estipula que software destinado a fornecer informação utilizada para **tomar decisões com fins de diagnóstico ou terapêuticos** é classificado, no mínimo, como **Dispositivo Médico Classe IIa**.

#### Como Evitar que o Medgical Patients Infrinja o MDR:
Para que a aplicação **NÃO** seja qualificada como dispositivo médico (evitando o processo longo e complexo de certificação clínica e marcação CE médica antes de poder ser lançada), deve manter-se estritamente na categoria de **software de arquivo, organização, consulta e comunicação de dados**:

| Permitido no Medgical Patients (Fora de MDR) | Proibido no Medgical Patients (Entraria em MDR) |
| :--- | :--- |
| Organizar, filtrar e arquivar documentos e análises clínicas em categorias. | Sugerir diagnósticos automáticos a partir de sintomas ou valores de análises. |
| Apresentar a timeline de acontecimentos em ordem cronológica. | Calcular scores de risco médico (ex.: cálculo de risco cardiovascular Framingham) e dar alertas prognósticos. |
| Explicar o significado enciclopédico de termos médicos em linguagem acessível (ex.: o que é a HbA1c). | Interpretar se o resultado analítico do utilizador requer mudança de medicação. |
| Resumir factos e consultas já efetuadas e validadas por um profissional de saúde. | Recomendar terapêuticas, posologias, medicamentos alternativos ou doses. |
| Permitir que o paciente partilhe os dados com o seu médico através de QR Code. | Fazer triagem clínica de urgência com aconselhamento de comportamento. |

#### Medidas Obrigatórias na Aplicação:
1. **Avisos Legais Visíveis (*Disclaimers*):** Qualquer ecrã com explicações ou resumos deve apresentar a indicação: *"Esta informação tem caráter exclusivamente informativo e organizativo. Não constitui aconselhamento médico nem substitui o diagnóstico de um profissional de saúde."*
2. **Guardrails de IA:** Regras de prompt estritas que rejeitam qualquer pedido de diagnóstico ou prescrição com resposta padronizada de reencaminhamento para um médico.

---

### 2.4. Regulamento da Inteligência Artificial / AI Act (Regulamento (UE) 2024/1689)

O AI Act classifica e regula os sistemas de IA com base no risco potencial para os direitos fundamentais e a segurança.

#### Classificação de Risco
* Se o software fizesse diagnóstico clínico no âmbito do MDR, seria classificado como **Sistema de IA de Alto Risco** (Anexo III), com obrigações extremas de conformidade.
* Permanecendo como assistente de organização, busca semântica documental (RAG) e explicação simples, enquadra-se como **Sistema de Risco Específico / Transparência**:
  * **Artigo 50.º (Dever de Transparência):** Os utilizadores devem ser claramente informados de que estão a interagir com um sistema de IA ou a ler um resumo gerado automaticamente.

#### Requisitos Técnicos no Módulo de IA (`services/ai/`):
1. **Pseudonimização Prévia Obrigatória:** Antes de qualquer texto de relatório ou registo ser enviado a um modelo de linguagem (LLM), identificadores diretos (nome do paciente, número de utente/SNS, NIF, números de telefone, moradas) devem ser anonimizados ou omitidos.
2. **Política de Não-Retenção e Não-Treino (*Zero Data Retention*):** O fornecedor do modelo de IA (caso seja uma API externa como Anthropic, OpenAI ou Google Cloud na UE) tem de garantir contratualmente que os dados processados **não são armazenados permanentemente nem utilizados para treinar modelos fundacionais**.
3. **Fundamentação e Mitigação de Alucinações:** As respostas devem obrigatoriamente citar o registo ou documento original de onde a informação foi extraída (com link para a fonte), recusando responder quando não houver informação factual presente no historial.

---

### 2.5. Cibersegurança: Diretiva NIS 2 e Cyber Resilience Act (CRA)

* **Diretiva NIS 2 (Diretiva (UE) 2022/2555):**
  * O setor da saúde é considerado setor de alta criticidade. A integração com sistemas hospitalares e a plataforma Medgical exige conformidade na segurança da cadeia de fornecimento, resposta a incidentes e autenticação forte.
* **Cyber Resilience Act (CRA):**
  * Estabelece requisitos de segurança desde a conceção (*Security by Design*) para produtos de hardware e software ligados em rede:
    * Correção contínua de vulnerabilidades de bibliotecas e dependências (`bundler-audit`, `brakeman`, `npm audit`);
    * Ausência de credenciais ou segredos em código-fonte;
    * Encriptação forte em trânsito (TLS 1.3) e em repouso (PostgreSQL e S3).

---

### 2.6. Diretiva ePrivacy (Diretiva 2002/58/CE / Lei n.º 41/2004 em Portugal)

* **Proibição Absoluta de Rastreadores Comerciais / Publicitários:**
  * É expressamente proibida a inclusão de SDKs de publicidade, redes sociais ou analytics de terceiros que transmitam identificadores do dispositivo (IDFA/GAID) ou comportamento de navegação a partir da aplicação.
  * O acesso e armazenamento local no dispositivo (Keychain, Keystore, armazenamento local) deve limitar-se exclusivamente àquilo que é estritamente necessário para prestar o serviço solicitado pelo utilizador (tokens de sessão e chaves de cifra).

---

## 3. Matriz de Controlo Técnico e Prevenção de Infrações

| Domínio Legal | Requisito da Norma | Implementação Técnica no Medgical Patients | Risco em caso de Incumprimento |
| :--- | :--- | :--- | :--- |
| **RGPD Art. 9.º** | Consentimento explícito para dados de saúde | Modal obrigatório no registo e nas integrações externas, com consentimento granular registado na BD. | Coima até 20 M€ ou 4% do volume de negócios global; proibição de tratamento. |
| **RGPD Art. 17.º** | Direito ao apagamento definitivo | Endpoint `DELETE /api/v1/account` com eliminação completa e verificada em cascata na BD e no S3. | Violação de direitos dos titulares; sanção pelas autoridades nacionais (ex.: CNPD). |
| **RGPD Art. 20.º & EHDS** | Portabilidade e formatos interoperáveis | Exportação de dados estruturados em **HL7 FHIR R4 Bundle** (`GET /api/v1/patient/export.json`). | Incumprimento das metas de interoperabilidade europeias. |
| **MDR Regra 11** | Não realizar diagnóstico ou prescrição médica | Guardrails rígidos no LLM, foco exclusivo em organização e resumo, e disclaimers visíveis em todos os ecrãs. | Crime económico, interdição do produto e remoção imediata das lojas App Store e Google Play. |
| **AI Act Art. 50.º** | Transparência em conteúdos gerados por IA | Indicação visual clara ("Resumo gerado por IA"), citação de fontes documentais e pseudonimização prévia. | Coimas até 35 M€ ou 7% da faturação anual. |
| **NIS 2 / CRA** | Segurança da informação e integridade | Tokens de partilha efêmeros (>=128 bits guardados só em hash SHA-256), revogação instantânea, HTTPS estrito e encriptação em repouso. | Notificação obrigatória de violação de dados à autoridade em 72h e perda de reputação. |
| **ePrivacy** | Privacidade no dispositivo e zero telemetria invasiva | Zero SDKs de publicidade/rastreamento; utilização exclusiva de armazenamento seguro nativo do sistema operativo. | Sanções por tratamento ilícito e quebra de confidencialidade. |

---

## 4. Referências e Guias Oficiais

1. **RGPD:** [Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho](https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX%3A32016R0679).
2. **EHDS:** [Proposta de Regulamento do Espaço Europeu de Dados de Saúde](https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en).
3. **MDR / SaMD:** [MDCG 2019-11 Guidance on Qualification and Classification of Software in Regulation (EU) 2017/745](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf).
4. **AI Act:** [Regulamento (UE) 2024/1689 relativo à Inteligência Artificial](https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX%3A32024R1689).
5. **CEPD / EDPB:** [Orientações 03/2020 sobre o tratamento de dados relativos à saúde para fins de investigação e apps](https://edpb.europa.eu/).
