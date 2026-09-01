"""
FastAPI REST API routes for CVM Mandatory Financial Statements:
- DRA: Demonstração do Resultado Abrangente (CPC 26)
- DMPL: Demonstração das Mutações do Patrimônio Líquido (CPC 26 / Lei 6.404)
- DVA: Demonstração do Valor Adicionado (CPC 09 / Lei 6.404)
- NE: Notas Explicativas (CPC 26 / Resolução CVM 80/2022)
"""

from fastapi import APIRouter, Query
from typing import Optional
from backend.app.cvm.statements_service import cvm_statements_service

router = APIRouter(prefix="/statements", tags=["CVM Mandatory Financial Statements"])

@router.get("/dra")
def get_dra_statement(
    cod_cvm: Optional[int] = Query(None, description="Código CVM da companhia (opcional, default: empresa ativa)"),
    period: Optional[str] = Query(None, description="Período contábil específico")
):
    """
    Retorna a Demonstração do Resultado Abrangente (DRA) conforme CPC 26 / IAS 1
    e Resolução CVM nº 80/2022. Se não houver dados, retorna has_data: false.
    """
    return cvm_statements_service.get_dra_data(cod_cvm=cod_cvm, period=period)

@router.get("/dmpl")
def get_dmpl_statement(
    cod_cvm: Optional[int] = Query(None, description="Código CVM da companhia (opcional, default: empresa ativa)"),
    period: Optional[str] = Query(None, description="Período contábil específico")
):
    """
    Retorna a Demonstração das Mutações do Patrimônio Líquido (DMPL) conforme
    Lei nº 6.404/76 (Art. 186) e CPC 26. Se não houver dados, retorna has_data: false.
    """
    return cvm_statements_service.get_dmpl_data(cod_cvm=cod_cvm, period=period)

@router.get("/dva")
def get_dva_statement(
    cod_cvm: Optional[int] = Query(None, description="Código CVM da companhia (opcional, default: empresa ativa)"),
    period: Optional[str] = Query(None, description="Período contábil específico")
):
    """
    Retorna a Demonstração do Valor Adicionado (DVA) conforme CPC 09 e
    Art. 176, V da Lei nº 6.404/76 (obrigatória para companhias abertas).
    Se não houver dados, retorna has_data: false.
    """
    return cvm_statements_service.get_dva_data(cod_cvm=cod_cvm, period=period)

@router.get("/ne")
def get_ne_statement(
    cod_cvm: Optional[int] = Query(None, description="Código CVM da companhia (opcional, default: empresa ativa)")
):
    """
    Retorna as Notas Explicativas (NE) às Demonstrações Contábeis conforme
    CPC 26 (R1), Art. 176, §§ 4º e 5º da Lei nº 6.404/76 e Resolução CVM nº 80/2022.
    Se não houver dados, retorna has_data: false.
    """
    return cvm_statements_service.get_ne_data(cod_cvm=cod_cvm)
