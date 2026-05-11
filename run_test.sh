cd backend
rm pytest_out.txt
uv run pytest apps/indicators/tests/test_evidence_requirements.py::EvidenceRequirementTests::test_missing_mandatory_blocks_readiness --tb=short -v > pytest_out.txt 2>&1
cat pytest_out.txt | grep -A 50 "FAILED" || cat pytest_out.txt | tail -n 20
