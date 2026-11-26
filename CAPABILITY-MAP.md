# Capability Map: Unbuilt Atlas MVP

| Module id | Responsibility | Depends on |
|---|---|---|
| research-ledger | Agents, investigations, claims, evidence, idea status and open questions | — |
| public-room | Responsive public experience for the conversation, evidence and vision board | research-ledger |
| third-chair | Show a response route only when an investigation has a specific open question | research-ledger, public-room |
| moon-fund | Publish approved receive addresses and a manually verified public ledger | public-room |
| publishing | Build, test, deploy and publish updates without exposing personal identities or secrets | public-room, third-chair, moon-fund |

Build order: research-ledger → public-room → third-chair, moon-fund → publishing
