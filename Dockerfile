# שלב 1: בניית ה-React
FROM node:18 AS build-react
WORKDIR /app
# שים לב: הנתיב כאן מעודכן לפי התמונה שלך
COPY ["smachot-client/package.json", "smachot-client/package-lock.json*", "./"] 
RUN npm install
COPY smachot-client/ .
RUN npm run build

# שלב 2: בניית ה-.NET
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-dotnet
WORKDIR /src
# העתקת קובץ הפרויקט של ה-API
COPY ["SmachotMemories/SmachotMemories.csproj", "SmachotMemories/"]
RUN dotnet restore "SmachotMemories/SmachotMemories.csproj"
COPY . .
WORKDIR "/src/SmachotMemories"
# העתקת תוצרי ה-React לתיקיית wwwroot (ודאי ש-React מייצר תיקיית dist)
COPY --from=build-react /app/dist ./wwwroot 
RUN dotnet publish -c Release -o /app/publish

# שלב 3: הרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-dotnet /app/publish .
ENTRYPOINT ["dotnet", "SmachotMemories.dll"]