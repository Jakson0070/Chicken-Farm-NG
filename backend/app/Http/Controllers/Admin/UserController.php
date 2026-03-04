<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('role')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('role');

        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);
        $user->load('role');

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(['admin', 'user'])],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $user->role_id = $role->id;
        $user->save();
        $user->load('role');

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    public function promoteToAdmin(User $user): JsonResponse
    {
        $user->assignAdminRole();
        $user->load('role');

        return response()->json([
            'message' => 'User promoted to admin successfully',
            'user' => $user,
        ]);
    }

    public function demoteToUser(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot demote yourself',
            ], 403);
        }

        $user->assignUserRole();
        $user->load('role');

        return response()->json([
            'message' => 'User demoted to user successfully',
            'user' => $user,
        ]);
    }
}
