import { v4 as uuidv4 } from "uuid"

export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  createdAt: string
  authToken?: string
}

// In a real app, this would be a database
// For this demo, we'll use localStorage
class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private authListeners: ((user: User | null) => void)[] = []

  private constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private loadUserFromStorage(): void {
    if (typeof window === "undefined") return

    try {
      const userData = localStorage.getItem("saino-auth-user")
      if (userData) {
        this.currentUser = JSON.parse(userData)
        this.notifyListeners()
      }
    } catch (error) {
      console.error("Error loading user from storage:", error)
    }
  }

  private saveUserToStorage(user: User | null): void {
    if (typeof window === "undefined") return

    try {
      if (user) {
        localStorage.setItem("saino-auth-user", JSON.stringify(user))
      } else {
        localStorage.removeItem("saino-auth-user")
      }
    } catch (error) {
      console.error("Error saving user to storage:", error)
    }
  }

  private notifyListeners(): void {
    this.authListeners.forEach((listener) => listener(this.currentUser))
  }

  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback)

    // Call immediately with current user
    callback(this.currentUser)

    return () => {
      this.authListeners = this.authListeners.filter((listener) => listener !== callback)
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser
  }

  public async register(username: string, email?: string, password?: string): Promise<User> {
    // In a real app, this would make an API call to create a user
    // For this demo, we'll just create a user object

    // Check if username is already taken
    if (typeof window !== "undefined") {
      const existingUsers = JSON.parse(localStorage.getItem("saino-users") || "[]") as User[]
      if (existingUsers.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Username is already taken")
      }
    }

    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      createdAt: new Date().toISOString(),
      authToken: uuidv4(), // In a real app, this would be a JWT
    }

    // Save user to "database"
    if (typeof window !== "undefined") {
      const users = JSON.parse(localStorage.getItem("saino-users") || "[]") as User[]
      users.push(newUser)
      localStorage.setItem("saino-users", JSON.stringify(users))
    }

    // Set as current user
    this.currentUser = newUser
    this.saveUserToStorage(newUser)
    this.notifyListeners()

    return newUser
  }

  public async login(username: string, password?: string): Promise<User> {
    // In a real app, this would validate credentials against a database
    // For this demo, we'll just check if the user exists

    if (typeof window === "undefined") {
      throw new Error("Cannot login in server-side context")
    }

    const users = JSON.parse(localStorage.getItem("saino-users") || "[]") as User[]
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (!user) {
      throw new Error("User not found")
    }

    // In a real app, we would validate the password here

    // Generate a new auth token
    user.authToken = uuidv4()

    // Update user in "database"
    localStorage.setItem("saino-users", JSON.stringify(users.map((u) => (u.id === user.id ? user : u))))

    // Set as current user
    this.currentUser = user
    this.saveUserToStorage(user)
    this.notifyListeners()

    return user
  }

  public async logout(): Promise<void> {
    this.currentUser = null
    this.saveUserToStorage(null)
    this.notifyListeners()
  }

  public async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error("No user is logged in")
    }

    if (typeof window === "undefined") {
      throw new Error("Cannot update profile in server-side context")
    }

    // Update user in "database"
    const users = JSON.parse(localStorage.getItem("saino-users") || "[]") as User[]
    const updatedUser = { ...this.currentUser, ...updates }

    localStorage.setItem(
      "saino-users",
      JSON.stringify(users.map((u) => (u.id === this.currentUser!.id ? updatedUser : u))),
    )

    // Update current user
    this.currentUser = updatedUser
    this.saveUserToStorage(updatedUser)
    this.notifyListeners()

    return updatedUser
  }
}

export const authService = AuthService.getInstance()
