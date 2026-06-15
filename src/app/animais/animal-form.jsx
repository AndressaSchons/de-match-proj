"use client";

import { forwardRef } from "react";
import { DISPONIBILIDADE } from "@/lib/animal-constants";
import { AnimalPhotoUpload } from "@/components/AnimalPhotoUpload";
import styles from "./cadastro/cadastro-animal-form.module.css";

export const AnimalFormFields = forwardRef(function AnimalFormFields(
  { defaultValues = {}, idAnimal, children, onPhotoUploadingChange },
  photoRef
) {
  const d = defaultValues;
  const castradoVal = d.castrado === true ? "sim" : d.castrado === false ? "nao" : "nao";

  return (
    <>
      {idAnimal != null ? <input type="hidden" name="id_animal" value={String(idAnimal)} /> : null}

      <div className={styles.row}>
        <span className={styles.label}>Nome:</span>
        <input
          name="nome_animal" type="text" required autoComplete="off"
          className={`${styles.inputStretch} ${styles.fieldInput}`}
          defaultValue={d.nome_animal ?? ""}
        />
      </div>

      <div className={`${styles.row} ${styles.rowAlignStart}`}>
        <span className={styles.label}>Foto:</span>
        <AnimalPhotoUpload
          ref={photoRef}
          initialUrl={d.foto ?? null}
          onUploadingChange={onPhotoUploadingChange}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Sexo:</span>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input type="radio" name="sexo" value="femea" defaultChecked={d.sexo === "femea"} /> Fêmea
          </label>
          <label className={styles.radioLabel}>
            <input type="radio" name="sexo" value="macho" defaultChecked={d.sexo === "macho"} /> Macho
          </label>
        </div>
        <span className={`${styles.label} ${styles.labelRight}`}>Porte:</span>
        <select name="porte" defaultValue={d.porte ?? ""} className={styles.fieldSelect}>
          <option value="">—</option>
          <option value="pequeno">Pequeno</option>
          <option value="medio">Médio</option>
          <option value="grande">Grande</option>
        </select>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Castração:</span>
        <select name="castrado" required defaultValue={castradoVal} className={styles.fieldSelect}>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
        <span className={`${styles.label} ${styles.labelRight}`}>Situação:</span>
        <select name="disponibilidade" required defaultValue={d.disponibilidade ?? ""} className={styles.fieldSelect}>
          <option value="" disabled>Selecione…</option>
          {DISPONIBILIDADE.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Data de Nascimento:</span>
        <input
          name="data_nascimento" type="date"
          className={`${styles.inputShort} ${styles.fieldDate}`}
          defaultValue={d.data_nascimento ?? ""}
        />
        <span className={`${styles.label} ${styles.labelRight}`}>Cor/Raça:</span>
        <input
          name="raca" type="text"
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