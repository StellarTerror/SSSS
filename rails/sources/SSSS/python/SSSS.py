from amplify import *
from amplify.constraint import *
from amplify.client import FixstarsClient
import os

client = FixstarsClient()
client.token = os.environ['AMPLIFY_TOKEN']
client.parameters.timeout = 5000

N,M,K = map(int,input().split()) # N: 時間数, M: バイトの人数, K: グループの個数
A = [list(map(int,input().split())) for _ in range(M)]
B = [list(map(int,input().split())) for _ in range(K)]
C = [list(map(int,input().split())) for _ in range(M)]


cost1_weight = 1     # 勤務時間平均化の重み
cost2_weight = N*N*4 # 必要人数の重み
cost3_weight = N*N*N # 勤務可能かどうかの重み
cost4_weight = N*N*N # グループの制限の重み
cost5_weight = N*N   # 勤務回数最小化の重み

q = gen_symbols(BinaryPoly, M, N, K)
# q[i][j][k] := バイト i が時間 j にグループ k として勤務するかどうか

cost1 = BinaryPoly()

mean = BinaryPoly()
for i in range(M):
    for j in range(K):
        for k in range(N):
            mean += q[i][k][j]
mean /= M

for i in range(M):
    tmp = BinaryPoly()
    for j in range(K):
        for k in range(N):
            tmp += q[i][k][j]
    cost1 += (tmp-mean)*(tmp-mean)


cost2 = [equal_to(BinaryPoly(),0)]
for i in range(N):
    for j in range(K):
        tmp = BinaryPoly()
        for k in range(M):
            tmp += q[k][i][j]
        cost2.append(equal_to(tmp, min(B[j][i],M)))

cost3 = [equal_to(BinaryPoly(),0)]
for i in range(M):
    for j in range(N):
        tmp = BinaryPoly()
        for k in range(K):
            tmp += q[i][j][k]
        cost3.append(less_equal(tmp, C[i][j]))

cost4 = [equal_to(BinaryPoly(),0)]
for i in range(M):
    for j in range(N):
        for k in range(K):
            if A[i][k] == 0:
                cost4.append(equal_to(q[i][j][k],0))

cost5 = BinaryPoly()
for i in range(M):
    tmp = BinaryPoly()
    for j in range(K):
        tmp += q[i][0][j]
        for k in range(1,N):
            tmp += q[i][k][j]*(1-q[i][k-1][j]) + q[i][k-1][j]*(1-q[i][k][j]) # 前の時間に勤務したかどうかとxor
    cost5 += tmp


model = (cost1*cost1_weight + cost5*cost5_weight) + (sum(cost2)*cost2_weight + sum(cost3)*cost3_weight + sum(cost4)*cost4_weight)

solver = Solver(client)
solver.filter_solution = False
result = solver.solve(model)
if len(result) == 0:
    raise RuntimeError("Any one of constraints is not satisfied.")

energy, values = result[0].energy, result[0].values
v = decode_solution(q, values, 1)


for i in range(M):
    for j in range(N):
        tmp = -1
        for k in range(K):
            if v[i][j][k] == 1:
                tmp = k+1
        if j != N-1 :
            print(tmp, end=" ")
        else:
            print(tmp)