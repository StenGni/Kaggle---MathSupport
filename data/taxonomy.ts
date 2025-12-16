
import { MathCategory } from '../types';

export const MATH_TAXONOMY: MathCategory[] = [
  {
    id: "0",
    name: "Meta & Representation",
    subCategories: [
      {
        id: "0.1",
        name: "Reading & writing numbers",
        skills: [
          { id: "META.NUM.READ.INT", name: "Reading integers" },
          { id: "META.NUM.READ.DEC", name: "Reading decimals" },
          { id: "META.NUM.READ.FRAC", name: "Reading fractions" }
        ]
      }
    ]
  },
  {
    id: "1",
    name: "Whole Numbers & Place Value",
    subCategories: [
      {
        id: "1.1",
        name: "Place value",
        skills: [
          { id: "NUM.PLACE.WHOLE", name: "Place value (Whole)" },
          { id: "NUM.PLACE.DEC", name: "Place value (Decimals)" }
        ]
      },
      {
        id: "1.2",
        name: "Comparing & ordering",
        skills: [
          { id: "NUM.COMP.WHOLE", name: "Compare whole numbers" },
          { id: "NUM.COMP.DEC", name: "Compare decimals" }
        ]
      },
      {
        id: "1.3",
        name: "Rounding",
        skills: [
          { id: "NUM.ROUND.WHOLE", name: "Rounding whole numbers" },
          { id: "NUM.ROUND.DEC", name: "Rounding decimals" },
          { id: "NUM.EST.WHOLE", name: "Estimating (Whole)" },
          { id: "NUM.EST.DEC", name: "Estimating (Decimals)" }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Addition",
    subCategories: [
      {
        id: "2.1",
        name: "Addition Facts",
        skills: [
            { id: "ARITH.ADD.FACT.SINGLE", name: "Single-digit facts" },
            { id: "ARITH.ADD.FACT.TWO_DIG", name: "Mental two-digit" }
        ]
      },
      {
        id: "2.2",
        name: "Written Addition",
        skills: [
            { id: "ARITH.ADD.WHOLE.NO_REGROUP", name: "No carry" },
            { id: "ARITH.ADD.WHOLE.REGROUP", name: "With carrying" },
            { id: "ARITH.ADD.WHOLE.MANY_ADDENDS", name: "Adding 3+ numbers" }
        ]
      },
      {
        id: "2.3",
        name: "Decimals",
        skills: [
            { id: "ARITH.ADD.DEC.ALIGN", name: "Aligning decimals" },
            { id: "ARITH.ADD.DEC.NO_REGROUP", name: "Decimals no carry" },
            { id: "ARITH.ADD.DEC.REGROUP", name: "Decimals with carry" }
        ]
      },
      {
        id: "2.4",
        name: "Integers",
        skills: [
            { id: "ARITH.ADD.INT.SAME_SIGN", name: "Same signs" },
            { id: "ARITH.ADD.INT.OPPOSITE_SIGN", name: "Different signs" }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Subtraction",
    subCategories: [
        {
            id: "3.1",
            name: "Subtraction Facts",
            skills: [
                { id: "ARITH.SUB.FACT.SINGLE", name: "Single-digit facts" },
                { id: "ARITH.SUB.MENTAL.TWO_DIG", name: "Mental two-digit" }
            ]
        },
        {
            id: "3.2",
            name: "Written Subtraction",
            skills: [
                { id: "ARITH.SUB.WHOLE.NO_REGROUP", name: "No borrowing" },
                { id: "ARITH.SUB.WHOLE.REGROUP_SIMPLE", name: "Simple borrowing" },
                { id: "ARITH.SUB.WHOLE.REGROUP_MULTI", name: "Borrowing across zeros" }
            ]
        },
        {
            id: "3.3",
            name: "Decimals",
            skills: [
                { id: "ARITH.SUB.DEC.ALIGN", name: "Aligning decimals" },
                { id: "ARITH.SUB.DEC.NO_REGROUP", name: "Decimals no borrow" },
                { id: "ARITH.SUB.DEC.REGROUP", name: "Decimals with borrow" }
            ]
        },
        {
            id: "3.4",
            name: "Integers",
            skills: [
                { id: "ARITH.SUB.INT.SAME_SIGN", name: "Same sign" },
                { id: "ARITH.SUB.INT.OPPOSITE_SIGN", name: "Opposite sign" }
            ]
        }
    ]
  },
  {
    id: "4",
    name: "Multiplication",
    subCategories: [
        {
            id: "4.1",
            name: "Facts",
            skills: [
                { id: "ARITH.MUL.FACT.SINGLE", name: "Multiplication table" },
                { id: "ARITH.MUL.FACT.BY10", name: "Multiply by 10/100" }
            ]
        },
        {
            id: "4.2",
            name: "Multi-digit",
            skills: [
                { id: "ARITH.MUL.WHOLE.1x2_DIG", name: "1-digit x 2-digit" },
                { id: "ARITH.MUL.WHOLE.2x2_DIG", name: "2-digit x 2-digit" },
                { id: "ARITH.MUL.WHOLE.3x2_DIG", name: "Larger products" },
                { id: "ARITH.MUL.WHOLE.USING_ZEROES", name: "Using zeros" }
            ]
        },
        {
            id: "4.3",
            name: "Decimals",
            skills: [
                { id: "ARITH.MUL.DEC.BY_WHOLE", name: "Decimal x Whole" },
                { id: "ARITH.MUL.DEC.DEC", name: "Decimal x Decimal" }
            ]
        },
        {
            id: "4.4",
            name: "Fractions",
            skills: [
                { id: "ARITH.MUL.FRAC.PROPER", name: "Proper fractions" },
                { id: "ARITH.MUL.FRAC.MIXED", name: "Mixed numbers" },
                { id: "ARITH.MUL.FRAC.WHOLE", name: "Fraction x Whole" }
            ]
        },
        {
            id: "4.5",
            name: "Signed Numbers",
            skills: [
                { id: "ARITH.MUL.SIGNED.RULES", name: "Sign rules" }
            ]
        }
    ]
  },
  {
    id: "5",
    name: "Division",
    subCategories: [
        {
            id: "5.1",
            name: "Basic Division",
            skills: [
                { id: "ARITH.DIV.FACT.SINGLE", name: "Division facts" },
                { id: "ARITH.DIV.MENTAL.WHOLE", name: "Mental division" }
            ]
        },
        {
            id: "5.2",
            name: "Long Division",
            skills: [
                { id: "ARITH.DIV.WHOLE.1-DIG_DIV", name: "1-digit divisor" },
                { id: "ARITH.DIV.WHOLE.2-DIG_DIV", name: "2-digit divisor" },
                { id: "ARITH.DIV.WHOLE.REMAINDER", name: "Remainders" }
            ]
        },
        {
            id: "5.3",
            name: "Decimals",
            skills: [
                { id: "ARITH.DIV.DEC.BY_WHOLE", name: "Decimal / Whole" },
                { id: "ARITH.DIV.WHOLE.BY_DEC", name: "Whole / Decimal" },
                { id: "ARITH.DIV.DEC.DEC", name: "Decimal / Decimal" }
            ]
        },
        {
            id: "5.4",
            name: "Fractions",
            skills: [
                { id: "ARITH.DIV.FRAC.FRAC", name: "Fraction / Fraction" },
                { id: "ARITH.DIV.FRAC.WHOLE", name: "Fraction / Whole" },
                { id: "ARITH.DIV.WHOLE.FRAC", name: "Whole / Fraction" }
            ]
        },
        {
            id: "5.5",
            name: "Signed Numbers",
            skills: [
                { id: "ARITH.DIV.SIGNED.RULES", name: "Sign rules" }
            ]
        }
    ]
  },
  {
    id: "6",
    name: "Factors & Multiples",
    subCategories: [
        {
            id: "6.1",
            name: "Divisibility",
            skills: [
                { id: "NUM.FACTOR.LIST", name: "Factors" },
                { id: "NUM.MULTIPLE.LIST", name: "Multiples" },
                { id: "NUM.DIVIS.RULES", name: "Divisibility Rules" },
                { id: "NUM.PRIME.COMPOSITE", name: "Primes & Composites" },
                { id: "NUM.GCD.LCM.BASIC", name: "GCD & LCM" }
            ]
        }
    ]
  },
  {
    id: "7",
    name: "Fractions - Basics",
    subCategories: [
        {
            id: "7.1",
            name: "Understanding",
            skills: [
                { id: "FRAC.FORM.RECOG", name: "Recognize forms" },
                { id: "FRAC.FORM.CONVERT.MIXED_IMPROPER", name: "Mixed to improper" }
            ]
        },
        {
            id: "7.2",
            name: "Equivalence",
            skills: [
                { id: "FRAC.EQUIV.GEN", name: "Equivalent fractions" },
                { id: "FRAC.SIMPLIFY.BASIC", name: "Simplifying basic" },
                { id: "FRAC.SIMPLIFY.GCD", name: "Simplifying GCD" }
            ]
        },
        {
            id: "7.3",
            name: "Comparison",
            skills: [
                { id: "FRAC.COMP.SAME_DEN", name: "Same Denom" },
                { id: "FRAC.COMP.SAME_NUM", name: "Same Numerator" },
                { id: "FRAC.COMP.DIFF_DEN.LCD", name: "Common Denom" },
                { id: "FRAC.COMP.DIFF_DEN.CROSS", name: "Cross Mult" }
            ]
        }
    ]
  },
  {
    id: "8",
    name: "Fraction Operations",
    subCategories: [
        {
            id: "8.1",
            name: "Add/Subtract",
            skills: [
                { id: "FRAC.ADD.SAME_DEN", name: "Add (Same Denom)" },
                { id: "FRAC.ADD.DIFF_DEN.LCD", name: "Add (Diff Denom)" },
                { id: "FRAC.SUB.SAME_DEN", name: "Subtract (Same Denom)" },
                { id: "FRAC.SUB.DIFF_DEN.LCD", name: "Subtract (Diff Denom)" },
                { id: "FRAC.OP.MIXED", name: "Mixed Number Ops" }
            ]
        },
        {
            id: "8.2",
            name: "Mul/Div",
            skills: [
                { id: "FRAC.MUL.BASIC", name: "Basic Multiply" },
                { id: "FRAC.MUL.CANCEL", name: "Multiply w/ Cancel" },
                { id: "FRAC.DIV.BASIC", name: "Invert & Multiply" }
            ]
        }
    ]
  },
  {
    id: "9",
    name: "Decimals",
    subCategories: [
        {
            id: "9.1",
            name: "Basics",
            skills: [
                { id: "DEC.REP.PLACE", name: "Place Value" },
                { id: "DEC.CONV.FRAC.TERMINATING", name: "Fraction conversion" },
                { id: "DEC.COMP.ORDER", name: "Compare/Order" }
            ]
        },
        {
            id: "9.2",
            name: "Operations",
            skills: [
                { id: "DEC.ADD.SUB.BASIC", name: "Add/Sub Alignment" },
                { id: "DEC.MUL.PLACEMENT", name: "Decimal Placement" },
                { id: "DEC.DIV.BY_INT", name: "Div by Integer" },
                { id: "DEC.DIV.BY_DEC", name: "Div by Decimal" }
            ]
        }
    ]
  },
  {
    id: "10",
    name: "Percentages",
    subCategories: [
        {
            id: "10.1",
            name: "Basics",
            skills: [
                { id: "PERC.DEF.FRAC_DEC", name: "Definition" },
                { id: "PERC.CONV.FRAC", name: "To Fraction" },
                { id: "PERC.CONV.DEC", name: "To Decimal" }
            ]
        },
        {
            id: "10.2",
            name: "Calculations",
            skills: [
                { id: "PERC.CALC.OF_QUANTITY", name: "% of number" },
                { id: "PERC.CALC.WHAT_IS_PERCENT", name: "What % is" },
                { id: "PERC.CALC.BASE_NUMBER", name: "Find base" }
            ]
        },
        {
            id: "10.3",
            name: "Change",
            skills: [
                { id: "PERC.CHANGE.INCREASE", name: "Increase" },
                { id: "PERC.CHANGE.DECREASE", name: "Decrease" },
                { id: "PERC.CHANGE.MULTI_STEP", name: "Multi-step" }
            ]
        }
    ]
  },
  {
    id: "11",
    name: "Ratio & Proportions",
    subCategories: [
        {
            id: "11.1",
            name: "Ratios",
            skills: [
                { id: "RATIO.REP.FORM", name: "Forms" },
                { id: "RATIO.SIMPLE.SCALE", name: "Scaling" }
            ]
        },
        {
            id: "11.2",
            name: "Proportions",
            skills: [
                { id: "PROP.SOLVE.CROSS_MULT", name: "Cross Multiplication" },
                { id: "PROP.UNIT_RATE", name: "Unit Rate" },
                { id: "PROP.TABLE.SCALING", name: "Table Scaling" }
            ]
        },
        {
            id: "11.3",
            name: "Applications",
            skills: [
                { id: "PROP.APP.MIXTURE", name: "Mixtures" },
                { id: "PROP.APP.MAP_SCALE", name: "Scale Maps" }
            ]
        }
    ]
  },
  {
    id: "12",
    name: "Powers & Scientific Notation",
    subCategories: [
        {
            id: "12.1",
            name: "Exponents",
            skills: [
                { id: "POW.INT.SMALL", name: "Small Powers" },
                { id: "POW.RULES.MULT", name: "Product Rule" },
                { id: "POW.RULES.DIV", name: "Quotient Rule" }
            ]
        },
        {
            id: "12.2",
            name: "Roots",
            skills: [
                { id: "ROOT.SQ.SMALL", name: "Square Roots" },
                { id: "ROOT.SQ.APPROX", name: "Approximate Roots" }
            ]
        },
        {
            id: "12.3",
            name: "Scientific Notation",
            skills: [
                { id: "SCI.NOT.CREATE", name: "Create Notation" },
                { id: "SCI.NOT.OP.ADD_SUB", name: "Add/Sub Sci Not" },
                { id: "SCI.NOT.OP.MUL_DIV", name: "Mul/Div Sci Not" }
            ]
        }
    ]
  },
  {
    id: "13",
    name: "Algebra Basics",
    subCategories: [
        {
            id: "13.1",
            name: "Order of Operations",
            skills: [
                { id: "ALG.OO.BASIC", name: "PEMDAS Basic" },
                { id: "ALG.OO.WITH_SIGNED", name: "PEMDAS Signed" },
                { id: "ALG.OO.WITH_FRAC_DEC", name: "PEMDAS Frac/Dec" }
            ]
        },
        {
            id: "13.2",
            name: "Evaluating",
            skills: [
                { id: "ALG.EVAL.SUB_INTO_EXPR", name: "Substitute values" },
                { id: "ALG.EVAL.FUNC_SIMPLE", name: "Evaluate function" }
            ]
        },
        {
            id: "13.3",
            name: "Simplifying",
            skills: [
                { id: "ALG.SIMP.LIKE_TERMS", name: "Combine like terms" },
                { id: "ALG.SIMP.DISTRI", name: "Distributive property" }
            ]
        },
        {
            id: "13.4",
            name: "Word Problems",
            skills: [
                { id: "WP.TRANSL.ADD_SUB", name: "Translate Add/Sub" },
                { id: "WP.TRANSL.MUL_DIV", name: "Translate Mul/Div" },
                { id: "WP.TRANSL.PERC", name: "Translate Percent" },
                { id: "WP.TRANSL.RATIO_PROP", name: "Translate Ratio" }
            ]
        }
    ]
  },
  {
    id: "15",
    name: "Checking & Estimation",
    subCategories: [
        {
            id: "15.1",
            name: "Checking",
            skills: [
                { id: "META.CHECK.ESTIMATE", name: "Estimation Check" },
                { id: "META.CHECK.REVERSE", name: "Reverse Operation" },
                { id: "META.CHECK.UNIT_SENSE", name: "Unit Sense" }
            ]
        }
    ]
  },
  {
    id: "16",
    name: "Equations & Inequalities",
    subCategories: [
        {
            id: "16.1",
            name: "Linear Equations",
            skills: [
                { id: "EQ.LIN1.SOLVE.BASIC", name: "Solve ax+b=c" },
                { id: "EQ.LIN1.SOLVE.FRAC_DEC", name: "With fractions/dec" },
                { id: "EQ.LIN1.SOLVE.PAREN", name: "With parentheses" },
                { id: "EQ.LIN1.CHECK.SOLUTION", name: "Check solution" }
            ]
        },
        {
            id: "16.2",
            name: "Systems",
            skills: [
                { id: "EQ.LIN_SYS.2X2.SUBST", name: "Substitution" },
                { id: "EQ.LIN_SYS.2X2.ELIM", name: "Elimination" },
                { id: "EQ.LIN_SYS.2X2.DET", name: "Determinants" }
            ]
        },
        {
            id: "16.3",
            name: "Quadratics",
            skills: [
                { id: "EQ.QUAD.FACTOR", name: "Factoring" },
                { id: "EQ.QUAD.COMPLETING_SQUARE", name: "Completing Square" },
                { id: "EQ.QUAD.FORMULA.SUB", name: "Quadratic Formula Sub" },
                { id: "EQ.QUAD.FORMULA.DISC", name: "Discriminant" }
            ]
        },
        {
            id: "16.4",
            name: "Other Equations",
            skills: [
                { id: "EQ.RATIONAL.SOLVE", name: "Rational Equations" },
                { id: "EQ.ABS.SOLVE", name: "Absolute Value" },
                { id: "EQ.EXP.SOLVE.BASIC", name: "Basic Exponential" }
            ]
        },
        {
            id: "16.5",
            name: "Inequalities",
            skills: [
                { id: "INEQ.LIN1.SOLVE.BASIC", name: "Linear Inequalities" },
                { id: "INEQ.LIN1.SOLVE.MULT_DIV_NEG", name: "Sign Flipping" },
                { id: "INEQ.SYS.GRAPH", name: "Graphing Systems" }
            ]
        }
    ]
  },
  {
    id: "17",
    name: "Functions",
    subCategories: [
        {
            id: "17.1",
            name: "Evaluation",
            skills: [
                { id: "FUNC.EVAL.LINEAR", name: "Linear Eval" },
                { id: "FUNC.EVAL.QUAD", name: "Quadratic Eval" },
                { id: "FUNC.EVAL.POLY", name: "Polynomial Eval" },
                { id: "FUNC.EVAL.RATIONAL", name: "Rational Eval" },
                { id: "FUNC.TABLE.FILL", name: "Table Filling" },
                { id: "FUNC.INVERSE.SIMPLE", name: "Inverse Functions" }
            ]
        }
    ]
  },
  {
    id: "18",
    name: "Logarithms",
    subCategories: [
        {
            id: "18.1",
            name: "Basics",
            skills: [
                { id: "LOG.DEF.CHANGE_BASE", name: "Change of Base" },
                { id: "LOG.EVAL.BASE10", name: "Base 10 eval" },
                { id: "LOG.EVAL.BASE_E", name: "Natural Log" }
            ]
        },
        {
            id: "18.2",
            name: "Laws",
            skills: [
                { id: "LOG.LAWS.ADD", name: "Product Rule" },
                { id: "LOG.LAWS.SUB", name: "Quotient Rule" },
                { id: "LOG.LAWS.POWER", name: "Power Rule" },
                { id: "LOG.SIMPLIFY.EXPR", name: "Simplify Expression" }
            ]
        },
        {
            id: "18.3",
            name: "Equations",
            skills: [
                { id: "EQ.LOG.ISOLATE", name: "Isolate Log" },
                { id: "EQ.LOG.EXP_FORM", name: "Exponential Form" },
                { id: "EQ.LOG.MULTI_TERM", name: "Multi-term logs" }
            ]
        }
    ]
  },
  {
    id: "19",
    name: "Exponentials",
    subCategories: [
        {
            id: "19.1",
            name: "Simplification",
            skills: [
                { id: "EXP.SIMPLIFY.SAME_BASE", name: "Same Base" },
                { id: "EXP.SIMPLIFY.SAME_EXP", name: "Same Exponent" },
                { id: "EXP.CONT.FRACTIONS", name: "Fractional Exponents" }
            ]
        },
        {
            id: "19.2",
            name: "Equations",
            skills: [
                { id: "EXP.EQ.SAME_BASE", name: "Equating Exponents" }
            ]
        }
    ]
  },
  {
    id: "20",
    name: "Trigonometry",
    subCategories: [
        {
            id: "20.1",
            name: "Ratios",
            skills: [
                { id: "TRIG.RATIOS.RIGHT_TRI", name: "Right Triangle" },
                { id: "TRIG.RATIOS.INVERSE", name: "Inverse Trig" },
                { id: "TRIG.RATIOS.SPECIAL_ANGLES", name: "Special Angles" }
            ]
        },
        {
            id: "20.2",
            name: "Units",
            skills: [
                { id: "TRIG.CONV.DEG_RAD", name: "Degrees/Radians" },
                { id: "TRIG.EVAL.RAD", name: "Evaluate Radian" }
            ]
        },
        {
            id: "20.3",
            name: "Identities",
            skills: [
                { id: "TRIG.ID.PYTHAG", name: "Pythagorean Identity" },
                { id: "TRIG.ID.DOUBLE_HALF", name: "Double/Half Angle" },
                { id: "TRIG.ID.ADD_SUB", name: "Sum/Difference" }
            ]
        },
        {
            id: "20.4",
            name: "Equations",
            skills: [
                { id: "EQ.TRIG.BASIC.SOLVE", name: "Basic Equations" },
                { id: "EQ.TRIG.TRANSFORM", name: "Argument Transform" }
            ]
        },
        {
            id: "20.5",
            name: "Applications",
            skills: [
                { id: "TRIG.LAW.SINES", name: "Law of Sines" },
                { id: "TRIG.LAW.COSINES", name: "Law of Cosines" },
                { id: "TRIG.AREA.SINE", name: "Sine Area Formula" }
            ]
        }
    ]
  },
  {
    id: "21",
    name: "Complex Numbers",
    subCategories: [
        {
            id: "21.1",
            name: "Operations",
            skills: [
                { id: "CPLX.ADD_SUB", name: "Add/Subtract" },
                { id: "CPLX.MUL.BASIC", name: "Multiply" },
                { id: "CPLX.DIV.BY_CONJ", name: "Division" }
            ]
        },
        {
            id: "21.2",
            name: "Forms",
            skills: [
                { id: "CPLX.FORM.RECT_POLAR", name: "Rectangular/Polar" },
                { id: "CPLX.MOD.ARG", name: "Modulus/Argument" }
            ]
        },
        {
            id: "21.3",
            name: "Powers",
            skills: [
                { id: "CPLX.POW.DE_MOIVRE", name: "De Moivre" },
                { id: "CPLX.ROOTS.UNITY", name: "Roots of Unity" }
            ]
        }
    ]
  },
  {
    id: "22",
    name: "Analytic Geometry",
    subCategories: [
        {
            id: "22.1",
            name: "Lines",
            skills: [
                { id: "GEO.ANAL.LINE.SLOPE", name: "Slope" },
                { id: "GEO.ANAL.LINE.EQ.POINT_SLOPE", name: "Point-Slope" },
                { id: "GEO.ANAL.LINE.EQ.TWO_POINTS", name: "Two Points" },
                { id: "GEO.ANAL.LINE.DIST_POINT_LINE", name: "Dist Point-Line" }
            ]
        },
        {
            id: "22.2",
            name: "Vectors 2D",
            skills: [
                { id: "GEO.ANAL.DIST.POINTS", name: "Distance" },
                { id: "GEO.ANAL.MIDPOINT", name: "Midpoint" },
                { id: "VEC.2D.ADD_SUB", name: "Vector Add/Sub" },
                { id: "VEC.2D.SCALAR_MUL", name: "Scalar Mul" },
                { id: "VEC.2D.DOT", name: "Dot Product" }
            ]
        },
        {
            id: "22.3",
            name: "Conics",
            skills: [
                { id: "CONIC.CIRCLE.PARAMS", name: "Circle" },
                { id: "CONIC.PARABOLA.VERTEX", name: "Parabola" },
                { id: "CONIC.ELLIPSE.HYPERBOLA", name: "Ellipse/Hyperbola" }
            ]
        }
    ]
  },
  {
    id: "23",
    name: "Geometry",
    subCategories: [
        {
            id: "23.1",
            name: "2D Area/Perimeter",
            skills: [
                { id: "GEO.2D.PERIM.BASIC", name: "Perimeter" },
                { id: "GEO.2D.AREA.RECT_TRI", name: "Area Rect/Tri" },
                { id: "GEO.2D.AREA.PAR_TRAP", name: "Area Par/Trap" },
                { id: "GEO.2D.AREA.CIRCLE", name: "Area Circle" },
                { id: "GEO.2D.AREA.SECTOR", name: "Area Sector" }
            ]
        },
        {
            id: "23.2",
            name: "3D Volume/Surface",
            skills: [
                { id: "GEO.3D.VOL.PRISM_CYL", name: "Prism/Cyl" },
                { id: "GEO.3D.VOL.PYR_CONE", name: "Pyramid/Cone" },
                { id: "GEO.3D.VOL.SPHERE", name: "Sphere" }
            ]
        }
    ]
  },
  {
    id: "24",
    name: "Sequences & Series",
    subCategories: [
        {
            id: "24.1",
            name: "Sequences",
            skills: [
                { id: "SEQ.ARITH.NTH", name: "Arithmetic Nth" },
                { id: "SEQ.ARITH.SUM", name: "Arithmetic Sum" },
                { id: "SEQ.GEOM.NTH", name: "Geometric Nth" },
                { id: "SEQ.GEOM.SUM_FINITE", name: "Geometric Finite" },
                { id: "SEQ.GEOM.SUM_INFINITE", name: "Geometric Infinite" }
            ]
        },
        {
            id: "24.2",
            name: "Series",
            skills: [
                { id: "SERIES.SIGMA.EVAL", name: "Sigma Evaluation" },
                { id: "SERIES.BINOM.EXPANSION", name: "Binomial Expansion" }
            ]
        }
    ]
  },
  {
    id: "25",
    name: "Combinatorics & Stats",
    subCategories: [
        {
            id: "25.1",
            name: "Counting",
            skills: [
                { id: "COMB.FACTORIAL.CALC", name: "Factorials" },
                { id: "COMB.PERMUTATIONS", name: "Permutations" },
                { id: "COMB.COMBINATIONS", name: "Combinations" }
            ]
        },
        {
            id: "25.2",
            name: "Probability",
            skills: [
                { id: "PROB.BASIC.FAV_TOTAL", name: "Basic Prob" },
                { id: "PROB.MULTI.STEP", name: "Multi-step" },
                { id: "PROB.COND.BASIC", name: "Conditional" }
            ]
        },
        {
            id: "25.3",
            name: "Statistics",
            skills: [
                { id: "STAT.EXPECT.DISCRETE", name: "Expected Value" },
                { id: "STAT.VAR.DISCRETE", name: "Variance" }
            ]
        }
    ]
  },
  {
    id: "26",
    name: "Linear Algebra",
    subCategories: [
        {
            id: "26.1",
            name: "Matrices",
            skills: [
                { id: "MAT.ADD_SUB", name: "Add/Sub" },
                { id: "MAT.SCALAR_MUL", name: "Scalar Mul" },
                { id: "MAT.MUL.BASIC", name: "Multiply" },
                { id: "MAT.TRANSPOSE", name: "Transpose" }
            ]
        },
        {
            id: "26.2",
            name: "Determinants",
            skills: [
                { id: "MAT.DET.2X2", name: "Det 2x2" },
                { id: "MAT.DET.3X3.EXP", name: "Det 3x3" },
                { id: "MAT.INV.2X2", name: "Inverse 2x2" }
            ]
        },
        {
            id: "26.3",
            name: "Systems",
            skills: [
                { id: "MAT.SOLVE.AX_B", name: "Solve AX=B" },
                { id: "MAT.ROW.OP", name: "Row Operations" }
            ]
        },
        {
            id: "26.4",
            name: "Vectors 3D",
            skills: [
                { id: "VEC.3D.ADD_SUB", name: "Add/Sub 3D" },
                { id: "VEC.3D.DOT", name: "Dot Product" },
                { id: "VEC.3D.CROSS", name: "Cross Product" }
            ]
        }
    ]
  },
  {
    id: "27",
    name: "Calculus",
    subCategories: [
        {
            id: "27.1",
            name: "Limits",
            skills: [
                { id: "CALC.LIMIT.SUB_DIRECT", name: "Direct Subst" },
                { id: "CALC.LIMIT.FACTOR_CANCEL", name: "Factoring" },
                { id: "CALC.LIMIT.RATIONAL_INF", name: "Rational Inf" },
                { id: "CALC.LIMIT.ONE_SIDED", name: "One-sided" }
            ]
        },
        {
            id: "27.2",
            name: "Derivatives",
            skills: [
                { id: "CALC.DERIV.POWER_RULE", name: "Power Rule" },
                { id: "CALC.DERIV.PROD_RULE", name: "Product Rule" },
                { id: "CALC.DERIV.QUOT_RULE", name: "Quotient Rule" },
                { id: "CALC.DERIV.CHAIN_RULE", name: "Chain Rule" },
                { id: "CALC.DERIV.TRIG", name: "Trig Deriv" },
                { id: "CALC.DERIV.EXP_LOG", name: "Exp/Log Deriv" }
            ]
        },
        {
            id: "27.3",
            name: "Integrals",
            skills: [
                { id: "CALC.INT.POWER", name: "Power Rule Int" },
                { id: "CALC.INT.SUBST", name: "U-Substitution" },
                { id: "CALC.INT.BY_PARTS", name: "By Parts" },
                { id: "CALC.INT.TRIG_BASIC", name: "Trig Integrals" },
                { id: "CALC.INT.RATIONAL.PART", name: "Partial Fractions" },
                { id: "CALC.INT.DEF.EVAL", name: "Definite Integrals" }
            ]
        },
        {
            id: "27.4",
            name: "Series",
            skills: [
                { id: "CALC.SERIES.TERM_N", name: "Partial Sums" },
                { id: "CALC.SERIES.TAYLOR.EVAL", name: "Taylor Poly" }
            ]
        }
    ]
  },
  {
    id: "28",
    name: "Numerical Methods",
    subCategories: [
        {
            id: "28.1",
            name: "Basics",
            skills: [
                { id: "NUM.METH.ROUNDING.ERROR", name: "Rounding Error" },
                { id: "NUM.METH.NEWTON_STEP", name: "Newton's Method" },
                { id: "NUM.METH.TRAP_RULE", name: "Trapezoidal Rule" },
                { id: "NUM.METH.SIMPSON", name: "Simpson's Rule" }
            ]
        }
    ]
  }
];

export const findSkillById = (skillId: string) => {
    for (const cat of MATH_TAXONOMY) {
        for (const sub of cat.subCategories) {
            const skill = sub.skills.find(s => s.id === skillId);
            if (skill) return { category: cat, subCategory: sub, skill };
        }
    }
    return null;
};

// Helper to provide context to Gemini
export const getTaxonomyPromptContext = () => {
    return MATH_TAXONOMY.map(cat => 
        `${cat.name}: ` + cat.subCategories.map(sub => 
            sub.skills.map(s => `${s.id} (${s.name})`).join(", ")
        ).join("; ")
    ).join("\n");
};
