import sys
import re

filename = "backend/apps/api/views/exports.py"

with open(filename, "r") as f:
    content = f.read()

# Make sure we import EvidenceRequirement to avoid issues
content = content.replace("from apps.projects.models import AccreditationProject", "from apps.projects.models import AccreditationProject\nfrom apps.indicators.models import EvidenceRequirement, ProjectEvidenceRequirement")

with open(filename, "w") as f:
    f.write(content)
