"use client";

import { forwardRef, useEffect, useState } from "react";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { hojeIso } from "@/lib/adocao-form-parse";
import { AnimalPhotoUpload } from "@/components/AnimalPhotoUpload";
import { AdocaoTermoUpload } from "@/components/AdocaoTermoUpload";
import styles from "./cadastro/cadastro-animal-form.module.css";

/** Marca de campo obrigatório ao lado do rótulo. */
function Obrigatorio() {
  return <span className={styles.required} aria-hidden="true">*</span>;
}

// Opções de situação em ordem alfabética do rótulo.
const SITUACOES_ORDENADAS = [...DISPONIBILIDADE].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

export const AnimalFormFields = forwardRef(function AnimalFormFields(
  {
    defaultValues = {},
    idAnimal,
    children,
    onPhotoUploadingChange,
    podeAdocao = false,
    termoObrigatorio = false,
    adocaoDefaults = null,
    onTermoUploadingChange,
  },
  photoRef
) {
  const d = defaultValues;
  const castradoVal = d.castrado === true ? "sim" : d.castrado === false ? "nao" : "nao";

  // Situação "adotado" abre a seção de adoção (data + termo) para quem pode registrar adoções.
  const [situacao, setSituacao] = useState(d.disponibilidade ?? "");
  const mostrarAdocao = situacao === "adotado" && podeAdocao;

  // Seção fechada no meio de um upload: libera o botão Salvar.
  useEffect(() => {
    if (!mostrarAdocao) onTermoUploadingChange?.(false);
  }, [mostrarAdocao, onTermoUploadingChange]);

  return (
    <>
      {idAnimal != null ? <input type="hidden" name="id_animal" value={String(idAnimal)} /> : null}

      <p className={styles.requiredLegend}>
        <Obrigatorio /> Campos obrigatórios
      </p>

      <div className={styles.row}>
        <span className={styles.label}>Nome<Obrigatorio />:</span>
        <input
          name="nome_animal" type="text" required autoComplete="off"
          className={`${styles.inputStretch} ${styles.fieldInput}`}
          defaultValue={d.nome_animal ?? ""}
        />
      </div>

      <div className={`${styles.row} ${styles.rowAlignStart}`}>
        <span className={styles.label}>Fotos:</span>
        <AnimalPhotoUpload
          ref={photoRef}
          initialUrls={d.fotos ?? []}
          onUploadingChange={onPhotoUploadingChange}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Sexo<Obrigatorio />:</span>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input type="radio" name="sexo" value="femea" required defaultChecked={d.sexo === "femea"} /> Fêmea
          </label>
          <label className={styles.radioLabel}>
            <input type="radio" name="sexo" value="macho" defaultChecked={d.sexo === "macho"} /> Macho
          </label>
        </div>
        <span className={`${styles.label} ${styles.labelRight}`}>Porte<Obrigatorio />:</span>
        <select name="porte" required defaultValue={d.porte ?? ""} className={styles.fieldSelect}>
          <option value="" disabled>Selecione…</option>
          <option value="pequeno">Pequeno</option>
          <option value="medio">Médio</option>
          <option value="grande">Grande</option>
        </select>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Castração<Obrigatorio />:</span>
        <select name="castrado" required defaultValue={castradoVal} className={styles.fieldSelect}>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
        <span className={`${styles.label} ${styles.labelRight}`}>Situação<Obrigatorio />:</span>
        <select
          name="disponibilidade"
          required
          value={situacao}
          onChange={(e) => setSituacao(e.target.value)}
          className={styles.fieldSelect}
        >
          <option value="" disabled>Selecione…</option>
          {SITUACOES_ORDENADAS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      {mostrarAdocao ? (
        <div className={styles.adocaoSection}>
          <p className={styles.sectionDivider}>Adoção</p>
          <div className={styles.row}>
            <span className={styles.label}>Data da adoção<Obrigatorio />:</span>
            <input
              name="data_adocao" type="date" required
              max={hojeIso()}
              className={`${styles.inputShort} ${styles.fieldDate}`}
              defaultValue={adocaoDefaults?.data_adocao ?? hojeIso()}
            />
          </div>
          <div className={`${styles.row} ${styles.rowAlignStart}`}>
            <span className={styles.label}>
              Termo de adoção{termoObrigatorio ? <><Obrigatorio />:</> : " (opcional):"}
            </span>
            <div className={styles.inputStretch}>
              <AdocaoTermoUpload
                initialUrl={adocaoDefaults?.termo_adocao ?? null}
                onUploadingChange={onTermoUploadingChange}
              />
            </div>
          </div>
        </div>
      ) : situacao === "adotado" ? (
        <p className={styles.adocaoHint}>
          A data e o termo da adoção são registrados por um administrador ou validador.
        </p>
      ) : null}

      <div className={styles.row}>
        <span className={styles.label}>Data de Nascimento:</span>
        <input
          name="data_nascimento" type="date"
          className={`${styles.inputShort} ${styles.fieldDate}`}
          defaultValue={d.data_nascimento ?? ""}
        />
        <span className={`${styles.label} ${styles.labelRight}`}>Cor/Raça<Obrigatorio />:</span>
        <input
          name="raca" type="text" required
          className={`${styles.inputMid} ${styles.fieldInput}`}
          defaultValue={d.raca ?? ""}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Localização:</span>
        <input
          name="localizacao" type="text"
          className={`${styles.inputStretch} ${styles.fieldInput}`}
          placeholder="Cidade, abrigo, região…"
          autoComplete="off"
          defaultValue={d.localizacao ?? ""}
        />
      </div>

      <div>
        <p className={styles.sectionLabel}>Vacinação</p>
        <textarea name="vacinacao" rows={3} className={styles.fieldInput}
          placeholder="Vacinas aplicadas, datas, pendências…" defaultValue={d.vacinacao ?? ""} />
      </div>

      <div>
        <p className={styles.sectionLabel}>História:</p>
        <textarea name="descricao_historia" rows={4} className={styles.fieldInput}
          defaultValue={d.descricao_historia ?? ""} />
      </div>

      <div>
        <p className={styles.sectionLabel}>Observações</p>
        <textarea name="observacoes" rows={2} className={styles.fieldInput}
          defaultValue={d.observacoes ?? ""} />
      </div>

      {children}
    </>
  );
});