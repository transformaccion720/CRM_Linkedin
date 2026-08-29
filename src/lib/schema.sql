-- Tabla principal de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120),
    linkedin_url TEXT UNIQUE,
    email VARCHAR(255),
    company VARCHAR(255),
    position VARCHAR(255),
    connected_on DATE,
    status VARCHAR(50) DEFAULT 'Sin contactar',
    notes TEXT,
    priority INTEGER DEFAULT 1,
    follow_up_date DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices B-Tree optimizados para búsquedas, filtros y ordenamiento a escala
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority);
CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
