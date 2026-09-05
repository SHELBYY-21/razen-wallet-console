-- CoALA agent memory: semantic facts, episodic events, procedural how-tos.
-- Always scoped by account_id so recall never leaks across wallets.

create table if not exists agent_memory (
  id text primary key,
  kind text not null check (kind in ('semantic', 'episodic', 'procedural')),
  key text not null,
  value text not null,
  account_id text not null default 'desk',
  at timestamptz not null default now(),
  last_accessed timestamptz not null default now(),
  access_count integer not null default 0,
  importance real not null default 0.5
);

create unique index if not exists agent_memory_kind_key_acct
  on agent_memory (kind, key, account_id);

create index if not exists agent_memory_acct on agent_memory (account_id);
