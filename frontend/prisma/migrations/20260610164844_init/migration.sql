-- CreateTable
CREATE TABLE "to_do" (
    "id" SERIAL NOT NULL,
    "titolo" TEXT,
    "descrizione" TEXT,
    "priorita" TEXT,
    "scadenze" TEXT,
    "completata" INTEGER DEFAULT 0,
    "posizione" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "to_do_pkey" PRIMARY KEY ("id")
);
