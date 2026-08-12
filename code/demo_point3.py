a = .1
b = a + a + a
c = 3 * a
print(.3)
print(b)
print(c)
# en base 2 (0 et 1) .1 s'écrit 0,0001100110011.... (0011 se répète)
# Quand on additionne 3 approximations, on fait une approximation
# Vous avez déjà vu ça:
# 0.1 en base 3 (un tiers 1/3) s'écrit 0.333333333333333333
# ce qui donne 1/3 + 1/3 + 1/3 = 0.999999999999999 au lieu de donner 1
# https://www.h-schmidt.net/FloatConverter/IEEE754.html