# שלב 1: בניית ה-React
FROM node:18 AS build-react
WORKDIR /app
# העתקת קבצי ה-Package (הכוכבית עוזרת למצוא את הקובץ גם אם השם מעט שונה)
COPY smachot-client/package*.json ./
RUN npm install
COPY smachot-client/ .
RUN npm run build

# שלב 2: בניית ה-.NET
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-dotnet
WORKDIR /src
# העתקת קובץ הפרויקט
COPY SmachotMemories/*.csproj ./SmachotMemories/
RUN dotnet restore "SmachotMemories/SmachotMemories.csproj"
COPY . .
WORKDIR "/src/SmachotMemories"

# שלב 3: איחוד והרצה
# ודאי שתיקיית הפלט של React היא dist. אם לא, שאי ל-build
COPY --from=build-react /app/dist ./wwwroot 
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-dotnet /app/publish .
ENTRYPOINT ["dotnet", "SmachotMemories.dll"]