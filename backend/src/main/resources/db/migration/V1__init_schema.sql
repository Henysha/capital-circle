CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE capital_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    description VARCHAR(1000),
    contribution_goal NUMERIC(14, 2),
    created_by_user_id UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES capital_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role VARCHAR(24) NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_group_members_group_user UNIQUE (group_id, user_id)
);

CREATE TABLE contributions (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES capital_groups(id) ON DELETE CASCADE,
    contributor_user_id UUID NOT NULL REFERENCES app_users(id),
    amount NUMERIC(14, 2) NOT NULL,
    note VARCHAR(500),
    contributed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE funding_requests (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES capital_groups(id) ON DELETE CASCADE,
    requester_user_id UUID NOT NULL REFERENCES app_users(id),
    title VARCHAR(180) NOT NULL,
    description VARCHAR(1000),
    amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(24) NOT NULL,
    decided_by_user_id UUID REFERENCES app_users(id),
    decided_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES capital_groups(id) ON DELETE CASCADE,
    type VARCHAR(24) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    description VARCHAR(500) NOT NULL,
    contribution_id UUID REFERENCES contributions(id),
    funding_request_id UUID REFERENCES funding_requests(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_capital_groups_created_by ON capital_groups(created_by_user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_contributions_group ON contributions(group_id);
CREATE INDEX idx_funding_requests_group ON funding_requests(group_id);
CREATE INDEX idx_ledger_entries_group ON ledger_entries(group_id);
